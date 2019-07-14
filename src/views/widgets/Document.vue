<template>
  	<div>
		<div class="docmargin">
			<ec-paragraph v-bind:headerLevel="1" v-bind:subParagraphId="subParagraphId"></ec-paragraph>
		</div>
  	</div>
</template>
<script>
export default {
  props: {
    level: Number,
    editMode: Boolean
  },
  computed: {
    subParagraphId: function () {
      return this.$store.state.levelIdsArr[this.level].selectedObjId
    }
  }
}
</script>
<style >
	.docmargin {
		margin: 20px;
  		font-size: 16px;
		counter-reset: h2;
	}
	/*Fancy bit copied from the Internet: generates header numbers. Don't we just love the internet*/
	body {counter-reset: h2}
	h2 {counter-reset: h3}
	h3 {counter-reset: h4}
	h4 {counter-reset: h5}
	h5 {counter-reset: h6}
	h2:before {counter-increment: h2; content: counter(h2) ". "}
	h3:before {counter-increment: h3; content: counter(h2) "." counter(h3) ". "}
	h4:before {counter-increment: h4; content: counter(h2) "." counter(h3) "." counter(h4) ". "}
	h5:before {counter-increment: h5; content: counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) ". "}
	h6:before {counter-increment: h6; content: counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) "." counter(h6) ". "}
	h2.nocount:before, h3.nocount:before, h4.nocount:before, h5.nocount:before, h6.nocount:before { content: ""; counter-increment: none }
</style>
