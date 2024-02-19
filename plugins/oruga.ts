import Oruga from '@oruga-ui/oruga-next'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '../src/assets/scss/oruga.scss'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('vue-fontawesome', FontAwesomeIcon)
    nuxtApp.vueApp.use(Oruga)
})

//
// fontawesomeのアイコンの読み込み
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUser,
  faTimesCircle,
  faTimes,
  faArrowCircleUp,
  faBars,
  faCheckCircle,
  faMinusCircle,
  faExpandAlt,
  faExternalLinkAlt,
  faExclamationCircle,
  faSearch,
  faPlus,
  faMinus,
  faPen,
  faCopy,
  faQuestion,
  faUndo,
  faRedo,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import {
  faTimesCircle as farTimesCircle,
  faQuestionCircle as farQuestionCircle,
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faTimesCircle,
  faUser,
  farTimesCircle,
  faTimes,
  faArrowCircleUp,
  faBars,
  faCheckCircle,
  faMinusCircle,
  faExpandAlt,
  faExternalLinkAlt,
  faExclamationCircle,
  faSearch,
  faPlus,
  faMinus,
  faPen,
  faCopy,
  faQuestion,
  farQuestionCircle,
  faUndo,
  faRedo,
  faArrowUpRightFromSquare,
)
