<template>
  <v-container>
    <v-row>
      <v-col class="col-8">
        <p>aaaa</p>

        <div
          id="image-preview"
          class="image-preview"
          ref="bounder"
          v-bind:style="{ 'width': width * 0.5 + 'px', 'height': height * 0.5 + 'px' }"
        >
          <div id="view" style="width: 100%"></div>

          <div
            class="nub"
            v-for="(nub, i) in nubs"
            :key="i"
            v-bind:id="i"
            v-bind:style="{ 'left': nub.x + 'px', 'top': nub.y + 'px' }"
            v-draggable="draggable"
          ></div>
        </div>
        <canvas
          id="preview"
          class="draw-canvas"
          ref="preview"
          v-bind:width="width"
          v-bind:height="height"
          v-bind:style="{ 'width': width * 0.5 + 'px', 'height': height * 0.5 + 'px' }"
        />
        <div>
          <span v-for="(nub, i) in nubs" :key="i">{{ i }}: {{ nub }}</span>
        </div>
      </v-col>
      <v-col class="col-4">
        <p>bbbb</p>
        <canvas id="demo" class="demo" width="300" height="300"></canvas>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop, Watch } from "vue-property-decorator";
import {
  Draggable,
  DraggableValue,
  PositionDiff,
  Position
} from "draggable-vue-directive";
import * as fx from "glfx";

@Component({
  directives: {
    Draggable
  }
})
export default class ImageEditor extends Vue {
  private width = 0;
  private height = 0;



  private canvusSize(): { w: number; h: number } {
    return { w: this.width * 0.5, h: this.height * 0.5 };
  }

  public context!: CanvasRenderingContext2D;
  public preview!: HTMLCanvasElement;

  public canvas: fx.Canvas = fx.canvas();
  public originCancas: fx.Canvas = fx.canvas();
  public filterCancas: fx.Canvas = fx.canvas();

  private nubs: { x: number; y: number }[] = [
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 50, y: 50 },
    { x: 10, y: 50 }
  ];

  private draggable: DraggableValue = {
    onPositionChange: this.onPositionChanged
  };

  public onPositionChanged(
    posDiff?: PositionDiff,
    pos?: Position,
    event?: any
  ) {
    console.log("left corner", pos?.left);
    console.log("top corner", pos?.top);
    console.log("event", event);
    // console.log("posDiff", posDiff);

    const index = event?.target.id;

    // if ((index != null || index != undefined) && pos != undefined) {
    if (["0", "1", "2", "3"].includes(index)) {
      console.log(
        "あ",
        index,
        "い",
        pos,
        this.preview.offsetLeft,
        this.preview.offsetTop,
        (this.$refs.bounder as HTMLElement).offsetLeft,
        (this.$refs.bounder as HTMLElement).offsetTop,
      );
      const l = (this.$refs.bounder as HTMLElement).offsetLeft;
      const t = (this.$refs.bounder as HTMLElement).offsetTop;
      console.log('l:', l, 't:', t)
      this.nubs[index].x = (event?.x || 0) - l;
      this.nubs[index].y = (event?.y || 0) - t;
    }
    console.log(this.nubs);
    this.drawLines();
  }

  private drawLines() {
    const w = (this.$refs.preview as HTMLElement).offsetWidth;
    const h = (this.$refs.preview as HTMLElement).offsetHeight;

    console.log("キャンバスサイズ", w, h);
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.clearRect(0, 0, w * 2, h * 2);
    this.context.moveTo(this.nubs[0].x * 2, this.nubs[0].y * 2);
    this.context.lineTo(this.nubs[1].x * 2, this.nubs[1].y * 2);
    this.context.lineTo(this.nubs[2].x * 2, this.nubs[2].y * 2);
    this.context.lineTo(this.nubs[3].x * 2, this.nubs[3].y * 2);
    this.context.lineTo(this.nubs[0].x * 2, this.nubs[0].y * 2);
    this.context.closePath();
    this.context.strokeStyle = "#F865B0";
    this.context.stroke();

    this.context.moveTo(0, 0);
    this.context.lineTo(100, 0);
    this.context.lineTo(100, 100);
    this.context.lineTo(0, 100);
    this.context.lineTo(0, 0);
    this.context.stroke();
  }

  @Prop()
  public currentFile!: File;

  private drawRect() {
    console.log(fx.Shader, fx.Canvas, fx.Texture)
    fx.Shader.getDefaultShader().drawRect(10,10,200,200)
  }

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
        
        
        // this.context.drawImage(img, 0, 0);
        // this.canvas.width = 512
        // this.canvas.height = 512
        this.canvas.style.width = "100%"
        console.log(this.canvas.texture(img))
        this.canvas.texture(img)._.drawTo(this.drawRect)
        this.canvas.update()
        // this.canvas.draw(this.canvas.texture(img), img.width, img.height).update();
        // this.preview = this.canvas.draw(this.canvas.texture(img));
        const ctx = this.canvas.getContext("webgl")!;
        console.log(this.canvas, ctx, img.naturalWidth, img.width, img.naturalHeight, img.height)
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

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.draggable.boundingElement = this.$refs.bounder as HTMLElement;

    window.addEventListener("resize", this.windowResize);

    const demo: any = document.getElementById("demo");
    const ctx: CanvasRenderingContext2D = demo.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(100, 10);
    ctx.lineTo(100, 100);
    ctx.lineTo(10, 100);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(200, 0);
    ctx.lineTo(200, 200);
    ctx.lineTo(0, 200);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(300, 0);
    ctx.lineTo(300, 300);
    ctx.lineTo(0, 300);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    // ctx.clearRect(0, 0, 200, 200)
    ctx.arc(100, 100, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  public beforeDestroy() {
    window.removeEventListener("resize", this.windowResize);
  }

  public windowResize(event: any) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    console.log(this.width, this.height);
  }
}
</script>

<style>
.demo {
  border: 1px solid #444;
  /* position: absolute; */
  /* display: flex; */
}

.canvas {
  border: 1px solid #444;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  /* align-self: flex-end; */
}

.draw-canvas {
  /* width: 100%; */
  /* height: 100%; */
  /* display: flex; */
  border: 1px solid #444;
  background-color: rgba(255, 255, 0, 0.2);
}

.image-preview {
  /* width: 50%; */
  /* aspect-ratio: 1; */
  display: flex;
  border: 1px solid #444;
  /* background-color: #eaeaea; */
  background-color: rgba(255, 255, 255, 0);
  position: absolute;
}

.fill {
  height: 100%;
}

.nub {
  position: absolute;
  width: 12px;
  height: 12px;
  margin: 0px;
  /* background: #3f9fff; */
  /* background: -moz-linear-gradient(#7fbfff, #007fff); */
  /* background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#7fbfff),
    to(#007fff)
  ); */
  border: 1px solid #F865B0;
  border-radius: 6px;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  /* box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); */
  /* -moz-box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); */
  /* -webkit-box-shadow: 0 2px 2px rgba(0, 0, 0, 0.5); */
  cursor: move;
}

#nubs {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
