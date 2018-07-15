<template>
    <div class="hello">
        <div style="display: inline-flex">
        <textarea style="width:200px;height:300px;white-space: pre-wrap;"
                  :value="JSON.stringify(myData,null,4)"
                  @blur="myData=JSON.parse($event.target.value)"></textarea>
            <div style="margin-left:10px">
                <input type="button" value="edit mode" @click="editable=!editable"/>
                <div>
                    <v-json-editor
                            :data="myData"
                            :editable="editable"
                            @change="$forceUpdate()"></v-json-editor>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'JsonEditor',
    data:{
        editable: false,
        myData: {
            "name": "leo",
            "country": "cn",
            "jobs": [
                "student",
                "qa",
                "developer",
                "unknow",
                "type [] in value field to transfer to array block"
            ],
            "this is a object": {
                "how": "type {} in value field to transfer to object block"
            }
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
