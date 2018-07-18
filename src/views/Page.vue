<template>
    <multipane class="vertical-panes" layout="vertical">
        <div class="pane" :style="{ width: '150px'}">
            <div>
                <h6 class="title is-6">Pane 1</h6>
                <p class="subtitle is-6">Fixed width.</p>
                <p>
                    <small>
                        <strong>Configured with:</strong><br/>
                        minWidth: 100px<br/>
                        width: 150px<br/>
                        maxWidth: 200px<br/>
                    </small>
                </p>
            </div>
        </div>
        <multipane-resizer></multipane-resizer>
        <div class="pane">
            <div>
                <h6 class="title is-6">Pane 2</h6>
                <p class="subtitle is-6">Fluid width.</p>
                <p>
                    <small>
                        <strong>Configured with:</strong><br/>
                        width: 25%<br/>
                        maxWidth: 50%<br/>
                    </small>
                </p>
            </div>
        </div>
    </multipane>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  components: {
    Multipane,
    MultipaneResizer
  }
}
</script>

<style>
    .vertical-panes {
        width: 100%;
        height: 100%;
    }

    .vertical-panes > .pane {
        text-align: left;
        padding: 15px;
        overflow: hidden;
    }

    .vertical-panes > .pane ~ .pane {
        border-left: 3px solid blue;
    }
</style>
