use serde::{Serialize,Deserialize};
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Track {
    pub file: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub title: Option<String>,
    pub art_sha256: Option<String>,
}

fn main(){ let t=Track{file:None,artist:None,album:None,title:None,art_sha256:None}; println!("{}",serde_json::to_string(&t).unwrap());}
