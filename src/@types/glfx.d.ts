declare module "glfx" {
  function canvas(): Canvas;
  function shader(): Shader;

  export class Canvas extends HTMLCanvasElement {
    draw: (texture: Texture, width?: number, height?: number) => Canvas;
    perspective: (before: number[], after: number[]) => Canvas;
    update: () => Canvas;
    replace: (node: HTMLElement) => Canvas;
    getPixelArray: () => Uint8Array;
    texture: (image: HTMLImageElement) => Texture;
  }
  export class Texture {
    _: Texture;
    drawTo: (callback: () => void) => void;
  }
  export class Shader {
    drawRect: (left?: number, top?: number, right?: number, bottom?: number) => void;
    static getDefaultShader: () => Shader;
  }
}
