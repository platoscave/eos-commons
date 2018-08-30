export default {
    props:{
       maxHeight:{
          type:Number,
          required:false
       }
    }
    mounted(){
       let maxHeight = this.maxHeight;
       if(maxHeight){
          this.$el.style.maxHeight = maxHeight + 'px';
       }
    }
}
