#[cfg(test)]
mod estate_review {
 use super::*;
 use std::time::Duration;
 use tokio::{net::TcpListener,io::{AsyncBufReadExt,AsyncWriteExt,BufReader}};

 #[tokio::test]
 async fn review_blocked_command_defers_shutdown_and_idle_disconnect() {
  let listener=TcpListener::bind("127.0.0.1:0").await.unwrap();
  let address=listener.local_addr().unwrap();
  let (blocked_tx,blocked_rx)=oneshot::channel();
  let (release_tx,release_rx)=oneshot::channel();
  let server=tokio::spawn(async move {
   let (mut command,_)=listener.accept().await.unwrap(); command.write_all(b"OK MPD 0.24.0\n").await.unwrap();
   let (mut idle,_)=listener.accept().await.unwrap(); idle.write_all(b"OK MPD 0.24.0\n").await.unwrap();
   let mut command=BufReader::new(command);
   loop {let mut line=String::new(); command.read_line(&mut line).await.unwrap(); if line=="command_list_end\n" {break;}}
   command.get_mut().write_all(b"state: play\nsongid: 1\nelapsed: 1\nduration: 120\nlist_OK\nfile: track.flac\nId: 1\nTitle: A\nlist_OK\nOK\n").await.unwrap();
   let mut next=String::new(); command.read_line(&mut next).await.unwrap(); assert_eq!(next,"next\n");
   // Independent idle role fails while the mutation's ACK stays pending.
   drop(idle);
   blocked_tx.send(()).unwrap(); let _=release_rx.await;
  });
  let (remote_tx,remote_rx)=unbounded_channel(); remote_tx.send(RemoteCommand::Next).unwrap();
  let (shutdown_tx,shutdown_rx)=watch::channel(false);
  let (event_tx,mut event_rx)=unbounded_channel();
  let mut worker=tokio::spawn(run_worker(RuntimeInputs{connection:ConnectionConfig{address:nowplayd::mpd::MpdAddress::Tcp(address.to_string()),password:None},cache_root:None,log:Arc::new(StderrLifecycleLog)},remote_rx,shutdown_rx,move |event| {
   if let WorkerEvent::Clear{acknowledgement}=event {let _=event_tx.send("clear");let _=acknowledgement.send(Ok(()));} else if matches!(event,WorkerEvent::Publish(_)) {let _=event_tx.send("publish");} Ok(())
  }));
  tokio::time::timeout(Duration::from_secs(3),blocked_rx).await.unwrap().unwrap();
  shutdown_tx.send(true).unwrap();
  assert!(tokio::time::timeout(Duration::from_millis(200),&mut worker).await.is_err());
  let mut events=Vec::new(); while let Ok(event)=event_rx.try_recv(){events.push(event);}
  assert_eq!(events,["publish"]);
  println!("REPRODUCED: idle EOF + shutdown requested, but blocked mutation prevents both clear and worker termination; events={events:?}");
  worker.abort(); let _=worker.await; let _=release_tx.send(());server.await.unwrap();
 }
}
