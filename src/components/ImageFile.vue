<template>
  <v-container>
    <v-row class="text-center">
      <v-col>
        <v-file-input
          label="File input"
          type="file"
          v-model="item"
          accept="image/*"
          @change="onChange"
          name="img"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class ImageFile extends Vue {
  public item: File = new File([], "");

  @Emit()
  public select(file: File) {}

  public onChange(e: File) {
		this.item = e;
		this.select(this.item);
  }
}
</script>

<style>
#menu-left {
  width: 320px;
}

#imagelist {
  height: 80%;
  width: inherit;
  position: fixed;
  overflow: auto;
  /* z-index: 1; */
}
</style>
