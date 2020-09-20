<template>
  <v-container>
    <v-row>
      <v-col class="col-8">
        <h3>Image</h3>
        <canvas
          id="preview"
          class="preview"
          v-bind:width="size"
          v-bind:height="size"
          style="width: 100%"
        />
        <div>
          <code>{{ points }}</code>
        </div>
      </v-col>
      <v-col class="col-4">
        <h3>Cropped</h3>
        <canvas
          id="cropped"
          class="preview"
          v-bind:width="outputWidth"
          v-bind:height="outputHeight"
          style="width: 100%"
        ></canvas>
        <v-container>
          <v-row>
            <v-text-field v-model="outputWidth" label="Width" value="1024" suffix="px"></v-text-field>
          </v-row>
          <v-row>
            <v-text-field v-model="outputHeight" label="Height" value="646" suffix="px"></v-text-field>
          </v-row>
          <v-row>
            <v-btn block color="blue darken-1" dark @click="downloadFile">Download</v-btn>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop, Watch } from "vue-property-decorator";
import * as fx from "glfx";

@Component({
  directives: {}
})
export default class ImageEditor extends Vue {
  private width = 0;
  private height = 0;
  private outputWidth = 1024;
  private outputHeight = Math.round((1024 * 5.4) / 8.56);

  private isMouseDown = false;
  private focused: { key: number; state: boolean } = { key: 0, state: false };
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  public canvas: fx.Canvas = fx.canvas();

  public preview!: HTMLCanvasElement;
  public context!: CanvasRenderingContext2D;

  private texture!: fx.Texture;
  private imageData!: ImageData;
  private croppedURL!: string;
  private offset: { x: number; y: number } = { x: 0, y: 0 };
  private imageSize: { w: number; h: number } = { w: 0, h: 0 };
  private size = 2048;

  private points: { x: number; y: number }[] = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ];

  @Prop()
  public currentFile!: File;

  @Watch("currentFile")
  public fileChanged() {
    if (this.currentFile === undefined || this.currentFile.name == "") {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.currentFile);
    reader.onload = e => {
      const img = new Image();
      img.onload = e => {
        const [h, w] = [img.height, img.width];
        const l = Math.max(h / this.size, w / this.size);
        this.imageSize = { w: w, h: h };
        this.offset.x = (this.size - w / l) / 2;
        this.offset.y = (this.size - h / l) / 2;
        this.context.drawImage(img, this.offset.x, this.offset.y, w / l, h / l);
        this.imageData = this.context.getImageData(0, 0, this.size, this.size);

        const im = new Image();
        im.onload = e => {
          this.texture = this.canvas.texture(im);
        };
        im.src = this.preview.toDataURL();

        this.resetPoints();
        this.draw();
      };
      const f = e.target! as FileReader;
      img.src = f.result as string;
    };
  }

  private downloadFile() {
    if (this.croppedURL != null) {
      const url = this.croppedURL;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file.jpg");
      document.body.appendChild(link);
      link.click();
    }
  }

  private resetPoints() {
    this.points[0] = { x: this.size / 4, y: this.size / 4 };
    this.points[1] = { x: (this.size / 4) * 3, y: this.size / 4 };
    this.points[2] = { x: (this.size / 4) * 3, y: (this.size / 4) * 3 };
    this.points[3] = { x: this.size / 4, y: (this.size / 4) * 3 };
  }

  public mounted() {
    const view: any = document.getElementById("view");
    const c: any = document.getElementById("preview");
    this.context = c.getContext("2d")!;
    this.preview = c;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    window.addEventListener("resize", this.windowResize);
    document.addEventListener("mousemove", this.mouseMove, false);
    document.addEventListener("mousedown", this.mouseDown, false);
    document.addEventListener("mouseup", this.mouseUp, false);
  }

  public beforeDestroy() {
    window.removeEventListener("resize", this.windowResize);
    document.removeEventListener("mousemove", this.mouseMove);
    document.removeEventListener("mousedown", this.mouseDown);
    document.removeEventListener("mouseup", this.mouseUp);
  }

  public windowResize(event: any) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    console.log(this.width, this.height);
  }

  private drawCropped() {
    if (this.texture != null) {
      const src = this.points
        .map(e => [e.x, e.y])
        .reduce((e, t) => e.concat(t, []));
      const w = this.outputWidth,
        h = this.outputHeight;
      const dst = [0, 0, w, 0, w, h, 0, h];

      const size = this.imageSize;
      const c = this.canvas
        .draw(this.texture, this.size, this.size)
        .perspective(src, dst)
        .update();

      const cropped = document.getElementById("cropped") as HTMLCanvasElement;
      const ctx: CanvasRenderingContext2D = cropped.getContext("2d")!;
      const bytes = this.canvas.getPixelArray();

      const data = new ImageData(
        new Uint8ClampedArray(bytes),
        c.width,
        c.height
      );
      ctx.putImageData(data, 0, 0);
      this.croppedURL = cropped.toDataURL("image/jpg");
    }
  }

  private draw() {
    const ctx = this.context;
    ctx.putImageData(this.imageData, 0, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#F865B0";
    ctx.beginPath();
    ctx.moveTo(this.points[3].x, this.points[3].y);
    this.points.forEach(function(p) {
      ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.points.forEach(function(p) {
      ctx.lineTo(p.x, p.y);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    });

    this.drawCropped();
  }

  public mouseMove(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    const rect = this.preview.getBoundingClientRect();
    this.mousePosition = {
      x: Math.round(
        ((event.x - rect.left) * this.size) / (rect.right - rect.left)
      ),
      y: Math.round(
        ((event.y - rect.top) * this.size) / (rect.bottom - rect.top)
      )
    };

    this.mousePosition = {
      x: Math.min(Math.max(this.mousePosition.x, 0), this.size),
      y: Math.min(Math.max(this.mousePosition.y, 0), this.size)
    };

    if (this.focused.state) {
      this.points.splice(this.focused.key, 1, this.mousePosition);
      this.draw();
      return;
    }
    this.points.forEach((e, i) => {
      if (this.intersects(e)) {
        this.focused.key = i;
        this.focused.state = true;
      }
    });
    this.draw();
  }

  public mouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.focused.state = false;
  }

  public mouseDown(event: MouseEvent) {
    this.isMouseDown = true;
  }

  private intersects(point: { x: number; y: number }) {
    const r = 20;
    const areaX = this.mousePosition.x - point.x;
    const areaY = this.mousePosition.y - point.y;
    return areaX * areaX + areaY * areaY <= r * r;
  }
}
</script>

<style>
.preview {
  position: relative;
  background: #bfbfbf;
  display: inline-block;
  line-height: 479px;
  overflow: hidden;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEW/v7////+Zw/90AAAAEUlEQVQI12P4z8CAFWEX/Q8Afr8P8erzE9cAAAAASUVORK5CYII=);
  border: 1px solid black;
}
</style>
