import edge from 'edge.js'
import { formatMoney } from '#constants/money'
import { fieldTypeText } from '#constants/field'
import { cropFamilyText } from '#constants/crop'

edge.global('money', formatMoney)
edge.global('fieldTypeLabel', fieldTypeText)
edge.global('cropFamilyLabel', cropFamilyText)
