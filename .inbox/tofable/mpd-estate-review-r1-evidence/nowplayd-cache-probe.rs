use std::{collections::HashMap, io::Cursor};
use image::{DynamicImage,ImageFormat};
use nowplayd::{artwork::{ArtworkCache,ArtworkCoordinator,BinaryChunkSource}, config::AppConfig, mpd::{BinaryCommand,BinaryResponse,MpdError}, state::{PlayerState,MediaKey,OccurrenceId,PlaybackState}};

struct Source(Vec<u8>);
impl BinaryChunkSource for Source {
 async fn read_binary(&mut self,_kind:BinaryCommand,_uri:&str,_offset:usize)->Result<BinaryResponse,MpdError>{Ok(BinaryResponse{total_size:Some(self.0.len()),bytes:self.0.clone()})}
}
#[tokio::test]
async fn review_cache_cleanup_removes_unowned_images() {
 let temp=tempfile::TempDir::new_in("/private/tmp").unwrap();
 let mut png=Cursor::new(Vec::new());
 DynamicImage::new_rgba8(3,2).write_to(&mut png,ImageFormat::Png).unwrap();
 let mut source=Source(png.into_inner());
 let cache=temp.path().join("shared-artwork"); std::fs::create_dir(&cache).unwrap();
 let unrelated=cache.join("family-photo.jpg"); let mut jpeg=Cursor::new(Vec::new()); DynamicImage::new_rgb8(3,2).write_to(&mut jpeg,ImageFormat::Jpeg).unwrap(); std::fs::write(&unrelated,jpeg.into_inner()).unwrap();
 let mut env=HashMap::new(); env.insert("NOWPLAYD_CACHE_DIR".into(),cache.display().to_string());
 let config=AppConfig::load_from(temp.path(),&env).unwrap();
 let mut art=ArtworkCoordinator::new(ArtworkCache::new(config.cache_dir));
 art.observe_state(PlayerState{occurrence:Some(OccurrenceId(1)),media_key:Some(MediaKey("song.flac".into())),playback:PlaybackState::Playing,..Default::default()});
 let lookup=art.step(&mut source).await.unwrap(); art.complete_job(lookup.job.unwrap().run());
 let store=art.step(&mut source).await.unwrap(); let publish=art.complete_job(store.job.unwrap().run());
 assert!(publish.publication.unwrap().cover_url.is_some());
 assert!(!unrelated.exists(),"current implementation should demonstrate deletion");
 println!("REPRODUCED: first artwork activation deleted unrelated family-photo.jpg in an accepted cache_dir");
}
