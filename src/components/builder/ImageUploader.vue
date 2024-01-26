<template>
  <div class="image-uploader">
    <div class="import-file" :class="side" @dragover.prevent @drop="dropImage">
      <form action method="post" enctype="multipart/form-data" @submit="uploadImage">
        <input type="hidden" name="filePathPrefix" value="user-upload/" />
        <label class="hidden select-image">
          <span>
            画像を
            <br />選択
          </span>
          <input
            class="hidden"
            type="file"
            name="input"
            multiple="multiple"
            @change="selectImageFile"
          />
        </label>
        <button type="submit" class="hidden" v-if="file">保存</button>
      </form>
      <span class="drop-image">
        画像を
        <br />選択
      </span>
      <div class="preview" :class="side">
        <img v-if="file" :src="imageSrc" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['side', 'file', 'imageSrc', 'files'],
  methods: {
    dropImage() {
      this.$emit('drop-image', this.side);
    },
    selectImageFile() {
      this.$emit('select-image-file', this.side);
    },
    uploadImage() {
      this.$emit('upload-images', this.side);
    },
  }
}
</script>

<style lang="scss">
.import-file {
  background-color: blue;
  width: 60px;
  height: 60px;
  position: fixed;
  color: beige;
  font-size: 14px;
  text-align: center;
  &.left {
    left: 5px;
    bottom: 5px;
  }
  &.right {
    right: 5px;
    bottom: 5px;
  }
  span {
    display: block;
    padding-top: 15px;
    height: 100%;
    height: 45px;
  }

  &:hover {
    .select-image {
      display: block;
    }
    .drop-image {
      display: none;
    }
  }
  .preview {
    position: absolute;
    &.left {
      top: -100px;
      left: 60px;
    }
    &.right {
      top: -100px;
      right: 60px;
    }
    img {
      width: 100px;
    }
  }
  button[type="submit"] {
    display: block;
    position: absolute;
    height: 30px;
    width: 60px;
    background-color: blue;
    color: white;
    top: -30px;
  }
}
</style>