/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
| It also registers the messages shown for failed rules. Without it VineJS
| reports its built-in English messages, which would leak into the UI.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Заполните поле «{{ field }}»',
    'string': 'Поле «{{ field }}» должно быть текстом',
    'number': 'Поле «{{ field }}» должно быть числом',
    'positive': 'Поле «{{ field }}» должно быть больше нуля',
    'min': 'Поле «{{ field }}» не может быть меньше {{ min }}',
    'decimal': 'В поле «{{ field }}» допустимо не больше двух знаков после запятой',
    'minLength': 'Поле «{{ field }}» должно быть не короче {{ min }} символов',
    'maxLength': 'Поле «{{ field }}» должно быть не длиннее {{ max }} символов',
    'enum': 'Выберите значение из списка в поле «{{ field }}»',
    'email': 'Укажите корректный адрес электронной почты',
    'confirmed': 'Пароли не совпадают',
    'database.exists': 'Выберите значение из списка в поле «{{ field }}»',
    'database.unique': 'Это значение уже занято',

    'cropId.required': 'Выберите культуру из списка',
    'cropId.database.exists': 'Выберите культуру из списка',
    'fieldId.required': 'Выберите поле из списка',
    'fieldId.database.exists': 'Выберите поле из списка',
    'desiredYieldTons.required': 'Укажите желаемый урожай в тоннах',
    'stages.*.fertilizerId.database.exists': 'Выберите удобрение из списка',
  },
  {
    'fullName': 'Имя',
    'email': 'Электронная почта',
    'password': 'Пароль',
    'name': 'Название',
    'family': 'Семейство',
    'price': 'Цена',
    'avgYieldPerHa': 'Средняя урожайность',
    'area': 'Площадь',
    'type': 'Тип почвы',
    'sownArea': 'Площадь посева',
    'desiredYieldTons': 'Желаемый урожай',
    'actualYieldPerHa': 'Фактическая урожайность',
    'stages.*.stageName': 'Стадия',
    'stages.*.fertilizerId': 'Удобрение',
    'stages.*.dosagePerHa': 'Дозировка',
  }
)
