<template>
  <v-container class="home fill-height">
    <v-row class="text-center">
      <ImageFile @select="onSelected" />
    </v-row>
    <v-row class="text-center">
      <ImageEditor :currentFile="currentFile" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
// @ is an alias to /src
import { Component, Watch, Vue } from "vue-property-decorator";
import ImageFile from "@/components/ImageFile.vue";
import ImageEditor from "@/components/ImageEditor.vue";

@Component({
  components: {
    ImageFile,
    ImageEditor
  }
})
export default class Home extends Vue {
  private selectedIndex = 0;
  private data = new Map<string, any>();

  // Prop
  public currentFile: File = new File([], "");

  public onSelected(file: File) {
    this.currentFile = file;
  }
}
</script>
