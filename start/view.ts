import edge from 'edge.js'
import { formatMoney } from '#constants/money'
import { fieldTypeText } from '#constants/field'

edge.global('money', formatMoney)
edge.global('fieldTypeLabel', fieldTypeText)
