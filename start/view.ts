import edge from 'edge.js'
import { formatMoney } from '#constants/money'
import { FIELD_STATUS, FIELD_TYPE_TEXT } from '#constants/field'
import { CROP_FAMILY_TEXT } from '#constants/crop'
import { SEEDING_STATUS, PROBABILITY_LABEL, probabilityText } from '#constants/seeding'

edge.global('money', formatMoney)
edge.global('fieldTypeLabel', FIELD_TYPE_TEXT)
edge.global('cropFamilyLabel', CROP_FAMILY_TEXT)
edge.global('probabilityLabel', probabilityText)
edge.global('FIELD_STATUS', FIELD_STATUS)
edge.global('SEEDING_STATUS', SEEDING_STATUS)
edge.global('PROBABILITY_LABEL', PROBABILITY_LABEL)
