#![allow(dead_code)]
#[path = "/Users/golem/git/color-tool-kmeans/color-core/src/color.rs"]
mod color;
fn delta(a: [u8;3], b:[u8;3])->u8 { a.into_iter().zip(b).map(|(x,y)|x.abs_diff(y)).max().unwrap() }
fn main(){
 let mut changed=[0u64;3]; let mut worst=[0u8;3]; let mut example=[([0u8;3],[0u8;3]);3];
 for r in 0..=255u8 { for g in 0..=255u8 { for b in 0..=255u8 {
  let rgb=[r,g,b]; let lab=color::rgb8_to_oklab(rgb);
  let results=[color::oklab_to_rgb8(lab),color::oklab_to_srgb8_gamut_mapped(lab),color::oklab_to_srgb8_gamut_mapped(color::oklch_to_oklab(color::oklab_to_oklch(lab)))];
  for i in 0..3 { let d=delta(rgb,results[i]); if d!=0 {changed[i]+=1;} if d>worst[i] {worst[i]=d;example[i]=(rgb,results[i]);}}
 }}}
 println!("RGB cube 16777216 inputs; routes simple-clamp, gamut-mapped, gamut-mapped-via-OKLCH: changed={changed:?} max_channel_delta={worst:?} first_worst={example:?}");
 let lab=[0.65,0.4,0.2]; let rgb=color::oklab_to_srgb8_gamut_mapped(lab);
 println!("example input lab={lab:?} extraction_centroid={:?} mapped_rgb={rgb:?} inverse_byte_lch={:?}",color::oklab_to_oklch(lab),color::oklab_to_oklch(color::rgb8_to_oklab(rgb)));
}
