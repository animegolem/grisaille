#![allow(dead_code)]
mod before { include!("before_body.rs"); }
mod after {
 include!("after_body.rs");
 pub fn linear(lab:[f32;3])->[f32;3] {oklab_to_linear_rgb(lab)}
 pub fn from_linear(rgb:[f32;3])->[f32;3] {linear_rgb_to_oklab(rgb)}
 pub fn in_gamut(rgb:[f32;3])->bool {is_in_gamut_rgb(rgb)}
}
fn unit(state:&mut u64)->f32 {*state^=*state<<13;*state^=*state>>7;*state^=*state<<17;((*state>>40) as f32)/16777216.0}
fn rgb(state:&mut u64)->[u8;3] {std::array::from_fn(|_|(unit(state)*256.0) as u8)}
fn main(){
 let mut changed=[0u64;3];let mut old_changes=[0u64;3];let mut new_changes=[0u64;3];
 for r in 0..=255u8 {for g in 0..=255u8 {for b in 0..=255u8 {
  let rgb=[r,g,b];let lab=before::rgb8_to_oklab(rgb);
  let a=[before::oklab_to_rgb8(lab),before::oklab_to_srgb8_gamut_mapped(lab),before::oklab_to_srgb8_gamut_mapped(before::oklch_to_oklab(before::oklab_to_oklch(lab)))];
  let lab=after::rgb8_to_oklab(rgb);
  let z=[after::oklab_to_rgb8(lab),after::oklab_to_srgb8_gamut_mapped(lab),after::oklab_to_srgb8_gamut_mapped(after::oklch_to_oklab(after::oklab_to_oklch(lab)))];
  for i in 0..3{changed[i]+=u64::from(a[i]!=z[i]);old_changes[i]+=u64::from(a[i]!=rgb);new_changes[i]+=u64::from(z[i]!=rgb);}
 }}}
 println!("EXHAUSTIVE 16777216 before/after route mismatches={changed:?}; before changed={old_changes:?}; after changed={new_changes:?}");
 assert_eq!(changed,[0;3]); assert_eq!(old_changes,[0;3]); assert_eq!(new_changes,[0;3]);
 let mut seed=0x7a9069e239117ad1u64;
 for group in ["continuous","centroid"] {
  let mut direct=0u64;let mut compat=0u64;let mut lch_diff=0u64;let mut beyond=0u64;let mut compressed=0u64;
  for _ in 0..250000 {
   let lab=if group=="continuous" {[unit(&mut seed),unit(&mut seed)-0.5,unit(&mut seed)-0.5]} else {
    let a=after::rgb8_to_oklab(rgb(&mut seed));let b=after::rgb8_to_oklab(rgb(&mut seed));let t=unit(&mut seed);std::array::from_fn(|i|a[i]+(b[i]-a[i])*t)
   };
   let (bytes,mapped)=after::oklab_to_srgb8_gamut_mapped_with_oklab(lab);
   let old=before::oklab_to_srgb8_gamut_mapped(lab);let q=after::oklab_to_rgb8(mapped);
   compat+=u64::from(bytes!=old);direct+=u64::from(bytes!=q);
   if mapped!=lab {compressed+=1;}
   let linear=after::linear(mapped);if linear.iter().any(|v|*v<0.0||*v>1.0){beyond+=1;}
   let lch=after::oklab_to_oklch(mapped);let via=after::oklab_to_rgb8(after::oklch_to_oklab(lch));
   if bytes!=via {lch_diff+=1;if lch_diff<=2 {println!("OKLCH_REEXPRESSION {group}: input={lab:?} mapped={mapped:?} lch={lch:?} bytes={bytes:?} reexpressed={via:?}");}}
  }
  println!("{group} N=250000 legacy_differences={compat} paired_quantization_differences={direct} compressed={compressed} outside_strict_cube={beyond} lch_reexpression_differences={lch_diff}");
  assert_eq!(compat,0);assert_eq!(direct,0);
 }
 for lab in [[1.2,0.0,0.0],[-0.2,0.0,0.0],[0.65,0.4,0.2]]{
  let (bytes,mapped)=after::oklab_to_srgb8_gamut_mapped_with_oklab(lab);
  println!("BOUNDARY input={lab:?} mapped={mapped:?} linear={:?} clamped_linear={:?} bytes={bytes:?}",after::linear(mapped),after::linear(mapped).map(|v|v.clamp(0.0,1.0)));
 }
 for other in [0.05,0.2,0.4,0.6,0.8] {for step in 1..10 {
  let lab=after::from_linear([1.0+1e-6*(step as f32/10.0),other,0.3]);let linear=after::linear(lab);
  if after::in_gamut(linear)&&linear.iter().any(|v|*v<0.0||*v>1.0){let p=after::oklab_to_srgb8_gamut_mapped_with_oklab(lab);println!("EPSILON lab={lab:?} linear={linear:?} paired={p:?}");return;}
 }}
 panic!("epsilon probe not found");
}
