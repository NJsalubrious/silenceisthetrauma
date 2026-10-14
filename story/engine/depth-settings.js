// The two depth treatments, copied from depth-map-test (assets/layered-world/depth-settings.js).
// All distances are fractions of the source image.
window.SITT_DEPTH_SETTINGS = {
 defaultProfile: 'deeper',
 presets: {
  original: { label: 'Original subtle depth', enhanced: false, overscan: 1.025, responseMs: 220, verticalScale: 1 },
  deeper: {
   label: 'More depth', enhanced: true, overscan: 1.06, responseMs: 0,
   depthTravel: .026, layerParallax: .012, verticalScale: .45,
   opening: { depthTravel: .04 }
  }
 }
};
