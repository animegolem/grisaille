#![allow(dead_code)]
mod canvas { #[derive(Clone, Copy, Debug, PartialEq)] pub struct Rgb(pub u8, pub u8, pub u8); }
#[path = "/Users/golem/Git/termviz/src/color.rs"] mod color;
use color::Oklch;
fn main() {
  let a=Oklch{l:0.05,c:0.0,h:0.0}; let b=Oklch{l:0.5,c:0.15,h:210.0};
  for t in [0.0,0.0001,0.0006,0.001,0.5,1.0] {
    let r=color::lerp_oklch(a,b,t); println!("gray_to_color t={t}: {r:?}; achromatic={}",r.is_achromatic());
  }
  for i in 1..100000 {
    let l=i as f32/100000.0;
    let x=color::oklch_to_rgb(Oklch{l,c:0.00009,h:0.0});
    let y=color::oklch_to_rgb(Oklch{l,c:0.00009,h:180.0});
    if x!=y {println!("subthreshold hue affects output: L={l}, C=0.00009, h=0 {x:?}, h=180 {y:?}");break;}
  }
  let a=Oklch{l:0.5,c:0.07,h:100.0}; let b=Oklch{l:0.5,c:0.07,h:280.0};
  println!("opposition both orders {:?} {:?}",color::lerp_oklch(a,b,0.5),color::lerp_oklch(b,a,0.5));
}
