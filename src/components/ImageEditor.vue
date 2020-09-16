<template>
  <v-container>
    <v-row class="text-center fill-height">
      <v-col>
        <p>aaaa</p>
        <canvas id="preview" class="canvas"></canvas>
        <div class="canvas">
          <div id="view"></div>
        </div>
      </v-col>
      <v-col>
        <p>bbbb</p>
        <canvas class="canvas"></canvas>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop, Watch } from "vue-property-decorator";
import * as fx from "glfx";

@Component
export default class ImageEditor extends Vue {
  public context!: CanvasRenderingContext2D;
  public preview!: HTMLCanvasElement;

  public canvas: fx.Canvas = fx.canvas();
  // public texture: fx.Texture = canvas.texture(img);

  @Prop()
  public currentFile!: File;

  @Watch("currentFile")
  public fileChanged() {
    if (this.currentFile === undefined || this.currentFile.name == "") {
      // this.image = Preview.defaultSize;
      // this.scale = 1.0;
      // this.imageSrc = "";
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.currentFile);
    reader.onload = e => {
      const img = new Image();
      img.onload = e => {
        // this.image.w = img.width;
        // this.image.h = img.height;
        this.context.drawImage(img, 0, 0);
        this.canvas.draw(this.canvas.texture(img), 300, 300).update();
        // this.preview = this.canvas.draw(this.canvas.texture(img));
      };
      const f = e.target! as FileReader;
      img.src = f.result as string;
      // this.imageSrc = img.src;
    };
  }

  public mounted() {
    const view: any = document.getElementById("view");
    const c: any = document.getElementById("preview");
    this.context = c.getContext("2d")!;
    this.preview = c;
    this.canvas.replace(view);
  }
}
</script>

<style>
.canvas {
  border: 1px solid #444;
}

.fill {
  height: 100%;
}
</style>
