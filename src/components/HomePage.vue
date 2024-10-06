<script setup lang="ts"></script>

<template>
  <div class="homepage">
    <h1>Cloud Experiments</h1>
    <div class="example" @click="$router.push('/algocloud')">
      <h2>Algorithmic Cloud</h2>
      <span class="info"
        >A first attempt at an algorithmic cloud. Yikes! Did a five-year-old make this?<br />Ok, we
        might actually need to learn some new things here.</span
      >
    </div>
    <div class="example" @click="$router.push('/rotating-cube')">
      <h2>Rotating Cube</h2>
      <span class="info"
        >Read up on some 3d graphics and make a rotating cube in SVG.<br />Seems like SVG is not the
        way to go.</span
      >
    </div>
    <div class="example" @click="$router.push('/web-gl-first-example')">
      <h2>WebGL First Example</h2>
      <span class="info"
        >Time to get my head around WebGL.<br />First experiment: drawing some random shapes.</span
      >
    </div>
    <div class="example" @click="$router.push('/web-gl-circle')">
      <h2>WebGL Circle</h2>
      <span class="info">Drawing a circle with WebGL.</span>
    </div>
    <div class="example" @click="$router.push('/web-gl-square')">
      <h2>WebGL Square</h2>
      <span class="info">Drawing a square with WebGL.</span>
    </div>
    <div class="example" @click="$router.push('/web-gl-cube')">
      <h2>WebGL Cube</h2>
      <span class="info">Drawing a 3d cube with WebGL.</span>
    </div>
    <div class="example" @click="$router.push('/web-gl-rotating-cube')">
      <h2>WebGL Rotating Cube</h2>
      <span class="info">Make that cube rotate.</span>
    </div>
    <div class="example" @click="$router.push('/web-gl-rotating-cube-filled')">
      <h2>WebGL Rotating Cube Filled</h2>
      <span class="info"
        >Fill in those sides. And let's make make it resize properly as well whilst we're at
        it.</span
      >
    </div>
    <div class="example" @click="$router.push('/ray-marched-sphere')">
      <h2>Ray Marched Sphere</h2>
      <span class="info">Ray marching sounds cool. Let's try that.</span>
    </div>
    <div class="example" @click="$router.push('/ray-marched-cloud')">
      <h2>Ray Marched Cloud</h2>
      <span class="info"
        >Put it all together to make some better looking clouds.<br />Note, they are random. Refresh
        a few times until you get a nice one.</span
      >
    </div>
    <div class="example" @click="$router.push('/sidescrolling3')">
      <h2>Side Scrolling Cloud</h2>
      <span class="info">Make those clouds float by like... clouds.</span>
    </div>
    <div class="example" @click="$router.push('/sidescrolling4')">
      <h2>Side Scrolling Cloud 2</h2>
      <span class="info"
        >Make every cloud different.<br />Also, try out some new shading... but looks a little too
        "biological" I think.</span
      >
    </div>
    <div class="example" @click="$router.push('/layered-clouds')">
      <h2>Layered Clouds</h2>
      <span class="info"
        >Layer up those clouds to create some depth.<br />Frame rates are starting to become an
        issue.</span
      >
    </div>
    <div class="example" @click="$router.push('/perspective-scroll')">
      <h2>Perspective Scroll</h2>
      <span class="info">First step towards figuring out how to add a vertical scroll.</span>
    </div>
    <div class="example" @click="$router.push('/perspective-clouds')">
      <h2>Perspective Scroll Clouds</h2>
      <span class="info"
        >The clouds are back and now with vertical scroll.<br />Frame rate takes a serious
        hit!</span
      >
    </div>
    <div class="example" @click="$router.push('/beers-law-cube')">
      <h2>Beers Law Cube</h2>
      <span class="info"
        >Starting to go off the cartoony vibe. Let's hit the books again and try something
        better.<br />First experiment: fill a cube with smoke.</span
      >
    </div>
    <div class="example" @click="$router.push('/perlin-noise')">
      <h2>Perlin Noise</h2>
      <span class="info"
        >We need some randomness that isn't too random. Perlin noise to the rescue!</span
      >
    </div>
    <div class="example" @click="$router.push('/perlin-noise-texture')">
      <h2>Perlin Noise From Texture</h2>
      <span class="info"
        >We can sprinkle this in via a pre-computed texture to save some cycles.</span
      >
    </div>
    <div class="example" @click="$router.push('/perlin-beers-cube')">
      <h2>Perlin Beers Cube</h2>
      <span class="info"
        >A cube filled with non-uniform smoke thanks to a bit of Perlin noise.<br />Now with added
        click-and-rotate functionality.</span
      >
    </div>
    <div class="example" @click="$router.push('/lit-perlin-beer-cube')">
      <h2>Lit Perlin Beers Cube 1</h2>
      <span class="info">First go at adding some lighting... meh</span>
    </div>
    <div class="example" @click="$router.push('/lit-perlin-beer-cube2')">
      <h2>Lit Perlin Beers Cube 2</h2>
      <span class="info">Second attempt at adding some lighting... meh v2</span>
    </div>
    <div class="example" @click="$router.push('/carved-cube')">
      <h2>Carved Cube</h2>
      <span class="info"
        >Maybe my cube itself is a bit too uniform? Let's try and carve up the sides with some
        Perlin noise.<br />A little flicker now because of some non-Euclidean stuff creeping into
        our ray marching.</span
      >
    </div>
    <div class="example" @click="$router.push('/beers-carved-cube')">
      <h2>Perlin Beers Carved Cube</h2>
      <span class="info"
        >Let's pump that wobbly cube full of wobbly smoke.<br />
        Starting to really like how it looks now.
      </span>
    </div>
    <div class="example" @click="$router.push('/beers-carved-cube')">
      <h2>Perlin Beers Carved Cube</h2>
      <span class="info"
        >Let's pump that wobbly cube full of wobbly smoke.<br />
        Starting to really like how it looks now.
      </span>
    </div>
    <div class="example" @click="$router.push('/template-test')">
      <h2>Colour Changing Sky</h2>
      <span class="info">A quick tangent to make a nice colour-changing sky background.</span>
    </div>
    <div class="example" @click="$router.push('/lit-beers-carved-cube')">
      <h2>Lit Perlin Beers Carved Shape</h2>
      <span class="info"
        >Make a cloudier shape, pump it full of wobbly smoke and add some lighting.<br />Our best
        cloud so far!</span
      >
    </div>
    <div class="example" @click="$router.push('/sdf-font')">
      <h2>SDF Font</h2>
      <span class="info"
        >Make a ray-marched font, but be lazy and only make the letters we need.</span
      >
    </div>
    <div class="example" @click="$router.push('/cloudy-sdf-font')">
      <h2>Cloudy SDF Font</h2>
      <span class="info"
        >Of course we're going to fill that font with wobbly smoke.<br />Click for a vanish/appear
        animation as well.</span
      >
    </div>
    <div class="example" @click="$router.push('/fbm-background')">
      <h2>FBM Background</h2>
      <span class="info"
        >Start working on a better background with some layered fractional brownian motion fog.<br />
        Oh yeah, and the sun. We need a sun.</span
      >
    </div>
  </div>
</template>

<style scoped>
.homepage {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 2rem 4rem 2rem;
  overflow: auto;
}

.homepage > * + * {
  margin-top: 18px;
}

.example {
  border: 1px solid grey;
  width: 100%;
  max-width: 42rem;
  padding: 1rem 0.5rem;
  text-align: center;
  border-radius: 1rem;
  cursor: pointer;
}

.example:hover {
  border-color: gold;
}

h1,
h2 {
  color: lightgrey;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
    Verdana, sans-serif;
  margin: 0 0 0.5em 0;
}

h1 {
  font-size: 1.5reml;
}

h2 {
  font-size: 1.25rem;
}

span.info {
  display: block;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
    Verdana, sans-serif;
  color: lightgrey;
  font-size: 0.85rem;
  line-height: 1.5;
}

a {
  text-decoration: none;
  color: lightgrey;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
    Verdana, sans-serif;
  font-size: 24px;
}

a:hover {
  text-decoration: underline;
  color: yellow;
}
</style>
