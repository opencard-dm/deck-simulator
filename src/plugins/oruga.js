import { Modal, Icon, Dropdown, Button, ConfigProgrammatic, Input, Field, Tooltip, Notification } from '@oruga-ui/oruga-next'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '../assets/scss/oruga.scss'

export function useOruga(vueApp) {
  vueApp.component('vue-fontawesome', FontAwesomeIcon)
  vueApp
    .use(Modal)
    .use(Icon)
    .use(Dropdown)
    .use(Button)
    .use(Input)
    .use(Field)
    .use(Tooltip)
    .use(Notification)
  ConfigProgrammatic.setOptions({
    iconComponent: 'vue-fontawesome',
    iconPack: 'fas',
  })
}

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
  faSearch,
  faPlus,
  faMinus,
  faPen,
  faCopy,
  faQuestion,
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
  faSearch,
  faPlus,
  faMinus,
  faPen,
  faCopy,
  faQuestion,
  farQuestionCircle,
)
