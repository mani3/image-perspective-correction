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

  public save() {
    if (this.data.size == 0) {
      alert("Not found records");
      return;
    }
    const data = JSON.stringify(Object.fromEntries(this.data));
    const blob = new Blob([data], { type: "text/plain" });
    const a = document.createElement("a");
    a.download = "annotation.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    a.click();
  }

  public onSelected(file: File) {
    this.currentFile = file;
  }
}
</script>
