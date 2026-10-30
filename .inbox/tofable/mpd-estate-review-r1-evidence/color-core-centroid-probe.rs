#![allow(dead_code)]
#[path = "/Users/golem/git/color-tool-kmeans/color-core/src/color.rs"]
mod color;
fn main() {
let a=color::rgb8_to_oklab([0,255,0]); let b=color::rgb8_to_oklab([0,0,255]); let lab=std::array::from_fn(|i|(a[i]+b[i])*0.5);
println!("equal green+blue centroid lab={lab:?} raw_lch={:?} clamp_rgb={:?} mapped_rgb={:?} mapped_byte_lch={:?}",color::oklab_to_oklch(lab),color::oklab_to_rgb8(lab),color::oklab_to_srgb8_gamut_mapped(lab),color::oklab_to_oklch(color::rgb8_to_oklab(color::oklab_to_srgb8_gamut_mapped(lab))));
}
