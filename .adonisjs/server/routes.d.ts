import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'fields.index': { paramsTuple?: []; params?: {} }
    'fields.create': { paramsTuple?: []; params?: {} }
    'fields.store': { paramsTuple?: []; params?: {} }
    'fields.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fields.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fields.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fields.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.index': { paramsTuple?: []; params?: {} }
    'crops.create': { paramsTuple?: []; params?: {} }
    'crops.store': { paramsTuple?: []; params?: {} }
    'crops.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.index': { paramsTuple?: []; params?: {} }
    'fertilizers.create': { paramsTuple?: []; params?: {} }
    'fertilizers.store': { paramsTuple?: []; params?: {} }
    'fertilizers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'seedings.new.step1': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step2': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step2.back': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step3': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.store': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.index': { paramsTuple?: []; params?: {} }
    'seedings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'seedings.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'fields.index': { paramsTuple?: []; params?: {} }
    'fields.create': { paramsTuple?: []; params?: {} }
    'fields.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fields.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.index': { paramsTuple?: []; params?: {} }
    'crops.create': { paramsTuple?: []; params?: {} }
    'crops.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.index': { paramsTuple?: []; params?: {} }
    'fertilizers.create': { paramsTuple?: []; params?: {} }
    'fertilizers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'seedings.new.step1': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step2': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.index': { paramsTuple?: []; params?: {} }
    'seedings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'fields.index': { paramsTuple?: []; params?: {} }
    'fields.create': { paramsTuple?: []; params?: {} }
    'fields.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fields.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.index': { paramsTuple?: []; params?: {} }
    'crops.create': { paramsTuple?: []; params?: {} }
    'crops.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.index': { paramsTuple?: []; params?: {} }
    'fertilizers.create': { paramsTuple?: []; params?: {} }
    'fertilizers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'seedings.new.step1': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step2': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.index': { paramsTuple?: []; params?: {} }
    'seedings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'fields.store': { paramsTuple?: []; params?: {} }
    'crops.store': { paramsTuple?: []; params?: {} }
    'fertilizers.store': { paramsTuple?: []; params?: {} }
    'seedings.new.step2.back': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.new.step3': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.store': { paramsTuple: [ParamValue]; params: {'fieldId': ParamValue} }
    'seedings.complete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'fields.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'fields.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'fields.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'crops.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'fertilizers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}