import getTime from 'date-fns/getTime';
import format from 'date-fns-tz/format';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import * as superagent from 'superagent';

export enum Market {
  TAIWAN = 'TW',
  BRASIL = 'BR',
  Hong_Kong = 'HK',
  INDONESIA = 'ID',
  MALAYSIA = 'MY',
  MEXICO = 'MX',
  PHILIPPINES = 'PH',
  SINGAPORE = 'SG',
  THAILAND = 'TH',
  VIETNAM = 'VN',
}

export enum City {
  TW_TPE = 'TW_TPE',
  TW_TXG = 'TW_TXG',
  TW_KHH = 'TW_KHH',
}

export enum LanguagesTW {
  zh_TW = 'zh_TW',
}

export enum LanguagesHK {
  en_HK = 'en_HK',
  zh_HK = 'zh_HK',
}

export enum LanguagesBR {
  en_BR = 'en_BR',
  pt_BR = 'pt_BR',
}

export enum LanguagesID {
  en_ID = 'en_ID',
  id_ID = 'id_ID',
}

export enum LanguagesMY {
  en_MY = 'en_MY',
  ms_MY = 'ms_MY',
}

export enum LanguagesMX {
  en_MX = 'en_MX',
  es_MX = 'es_MX',
}

export enum LanguagesPH {
  en_PH = 'en_PH',
}

export enum LanguagesSG {
  en_SG = 'en_SG',
}

export enum LanguagesTH {
  th_TH = 'th_TH',
  en_TH = 'en_TH',
}

export enum LanguagesVN {
  en_VN = 'en_VN',
  vi_VN = 'vi_VN',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ServiceTypeTW {
  MOTORCYCLE = 'MOTORCYCLE',
  MPV = 'MPV',
  VAN = 'VAN',
  TRUCK175 = 'TRUCK175',
}

export enum LalamoveOrderStatus {
  ASSIGNING_DRIVER = 'ASSIGNING_DRIVER',
  ON_GOING = 'ON_GOING',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

export type lalamove = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  market: Market;
  defaultTimeout?: number;
};

export type ApiInfo = {
  market: Market;
  apiKey: string;
  apiSecret: string;
};

export type Languages = {
  [Market.TAIWAN]: LanguagesTW;
  [Market.Hong_Kong]: LanguagesHK;
  [Market.BRASIL]: LanguagesBR;
  [Market.THAILAND]: LanguagesTH;
  [Market.INDONESIA]: LanguagesID;
  [Market.MEXICO]: LanguagesMX;
  [Market.MALAYSIA]: LanguagesMY;
  [Market.SINGAPORE]: LanguagesSG;
  [Market.VIETNAM]: LanguagesVN;
  [Market.PHILIPPINES]: LanguagesPH;
};

export type RequestInfo = {
  url: string;
  method: HttpMethod;
  body?: object;
};

// TODO: other market serviceType
export const serviceTypeMap = {
  [Market.TAIWAN]: ServiceTypeTW,
  [Market.BRASIL]: ServiceTypeTW,
  [Market.Hong_Kong]: ServiceTypeTW,
  [Market.INDONESIA]: ServiceTypeTW,
  [Market.MALAYSIA]: ServiceTypeTW,
  [Market.MEXICO]: ServiceTypeTW,
  [Market.PHILIPPINES]: ServiceTypeTW,
  [Market.SINGAPORE]: ServiceTypeTW,
  [Market.THAILAND]: ServiceTypeTW,
  [Market.VIETNAM]: ServiceTypeTW,
};

// TODO:  & other market serviceType
export type ServiceType = ServiceTypeTW;

export type Location = {
  lat: number;
  lng: number;
};

export type Distance = {
  value: string;
  unit: string;
};

export type Contact = {
  name: string;
  phone: string; // E.164 format
};

export type DeliveryInfo = {
  stopIndex: number;
  receiver: Contact;
  remarks: { [key: string]: string };
};

export type DeliveryStop = {
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
};

export type DeliveryStopWithId = DeliveryStop & {
  stopId: string;
};

export type CashOnDelivery = {
  amount: string;
};

/**
 * scheduleAt is Date but in the end need to covert to string.
 *  Need city and serviceType to filter valid specialRequests
 */
export type rawQuoteRequest = Omit<QuoteRequest, 'scheduleAt'> & {
  city: City;
  scheduleAt?: Date;
};

export type QuoteRequest = {
  serviceType: ServiceType;
  language: Languages[Market];
  stops: Array<DeliveryStop>;
  scheduleAt?: string; // UTC ISO8601 format
  specialRequests?: Array<specialRequests>;
  isRouteOptimized?: boolean; // multiple drop off
  item?: Item;
  cashOnDelivery?: CashOnDelivery;
};

export enum Weight {
  LESS_THAN_3KG = 'LESS_THAN_3KG',
}

export enum Category {
  FOOD_DELIVERY = 'FOOD_DELIVERY',
  OFFICE_ITEM = 'OFFICE_ITEM',
}

export enum HandlingInstructions {
  KEEP_UPRIGHT = 'KEEP_UPRIGHT',
  FRAGILE = 'FRAGILE',
}
export type Item = {
  quantity: string;
  weight: Weight;
  categories: Array<Category>;
  handlingInstructions: Array<HandlingInstructions>;
};

export type DeliveryDetails = {
  stopId: string;
  name: string;
  phone: string;
  remark?: string;
};

export type OrderPlacementRequest = {
  quotationId: string;
  sender: Contact & {
    stopId?: string;
  };
  recipients: Array<DeliveryDetails>;
  isRecipientSMSEnabled?: boolean;
  isPODEnabled?: boolean;
  partner?: string;
  metadata?: Record<string, any>;
};

export type QuoteResponse = {
  quotationId: string;
  scheduleAt: string;
  serviceType: ServiceTypeTW;
  specialRequests?: Array<specialRequests>;
  expiresAt: string; // 5 mins
  priceBreakdown: PriceBreakdown;
  stops: Array<Stop>;
  item?: Item;
};

export type PriceBreakdown = {
  base: string;
  extraMileage: string;
  surcharge: string;
  totalBeforeOptimization: string;
  totalExcludePriorityFee: string;
  priorityFee?: string;
  total: string;
  currency: string;
};

export enum PODStauts {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  SIGNED = 'SIGNED',
  FAILED = 'FAILED',
}

export type Stop = DeliveryStopWithId & {
  name?: string;
  phone?: string;
  POD?: {
    status: PODStauts;
    image: string;
    deliveredAt: string;
  };
};

export type OrderPlacementResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: PriceBreakdown;
  priorityFee?: string;
  driverId: string;
  shareLink: string;
  status: LalamoveOrderStatus;
  distance: Distance;
  stops: Array<Stop>;
  metadata: Record<string, any>;
  cashOnDelivery: CashOnDelivery;
};

export type OrderDetailResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: PriceBreakdown;
  priorityFee: string;
  status: LalamoveOrderStatus;
  cashOnDelivery: CashOnDelivery;
  driverId: string;
  shareLink: string;
  distance: Distance;
  stops: Array<Stop>;
  metadata: Record<string, any>;
};

export type DriverDetailResponse = {
  driverId: string;
  name: string;
  phone: string;
  plateNumber: string;
  coordinates: {
    lat: string;
    lng: string;
    updatedAt: string;
  };
};

export type DriverLocationResponse = {
  location: {
    lat: string;
    lng: string;
  };
  updatedAt: string;
};

export type CancelOrderResponse = object;

export type AddPriorityFeeResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: PriceBreakdown;
  shareLink: string;
  driverId: string;
  status: LalamoveOrderStatus;
  distance: Distance;
  stops: Array<Stop>;
};

export enum specialRequests {
  Lalabag = 'THERMAL_BAG_1',
  LalabagSUV = 'THERMAL_BAG_1',
  HelpBuy = 'PURCHASE_SERVICE_1',
  FragileGood = 'FRAGILE_GOODS',
  ChildPurchaseService1 = 'PURCHASE_SERVICE_2',
  ChildPurchaseService2 = 'PURCHASE_SERVICE_3',
  English = 'ENGLISH',
  ChildTollPercentage1 = 'TOLL_FEE_1',
  ChildSingleSelect1 = 'TOLL_FEE_1',
  ChildMultiSelect1 = 'TOLL_FEE_1',

  ChildSingleSelect2 = 'TOLL_FEE_2',
  ChildMultiSelect2 = 'TOLL_FEE_2',
  ChildTollPercentage2 = 'TOLL_FEE_2',

  ChildTollPercentage3 = 'TOLL_FEE_3',
  ChildMultiSelect3 = 'TOLL_FEE_3',
  ChildSingleSelect3 = 'TOLL_FEE_3',

  ChildTollPercentage4 = 'TOLL_FEE_4',
  ChildMultiSelect4 = 'TOLL_FEE_4',
  ChildSingleSelect4 = 'TOLL_FEE_4',

  ChildMultiSelect5 = 'TOLL_FEE_5',
  ChildMultiSelect6 = 'TOLL_FEE_6',
  ChildMultiSelect7 = 'TOLL_FEE_7',
  ChildMultiSelect8 = 'TOLL_FEE_8',
  ChildMultiSelect9 = 'TOLL_FEE_9',
  ChildMultiSelect10 = 'TOLL_FEE_10',
  FragileGoods = 'FRAGILE_GOODS',
  PaidByRecipient = 'CASH_ON_DELIVERY',
  RequireLift = 'MOVING_GOODS_UPSTAIR_REQUIRE_LIFT',
  thermalBag = 'THERMAL_BAG_1',
  Pets = 'PETS',
  RequireLiftWithElevator = 'MOVING_GOODS_UPSTAIR_REQUIRE_LIFT',
  Tailgate = 'TAILBOARD',
  Refrigerator = 'REFRIGERATED_UV_1',
  Freezer = 'REFRIGERATED_UV_2',
  SelfServedHouseMoving = 'MOVING_SERVICE',
  MovingUpstairsWithElevator = 'MOVING_GOODS_UPSTAIR_REQUIRE_LIFT',
  ProfessionalHouseMoving = 'MOVING_SERVICE_1',
  MovingUpstairsWithoutElevatorB1and2to3F = 'MOVING_SERVICE_2',
  MovingUpstairsWithoutElevator4to6F = 'MOVING_SERVICE_3',
  PortageFee = 'MOVING_SERVICE_4',
}

const getValidSpecialRequests = ({
  city,
  serviceType,
  specialRequestsFromRequest = [],
}: {
  serviceType: ServiceType;
  city: City;
  specialRequestsFromRequest: Array<specialRequests>;
}) => {
  let validSpecialRequest: Array<specialRequests> = [];
  switch (city) {
    case City.TW_TPE: {
      switch (serviceType) {
        case serviceTypeMap.TW.MOTORCYCLE: {
          validSpecialRequest = [
            specialRequests.Lalabag,
            specialRequests.HelpBuy,
            specialRequests.FragileGood,
            specialRequests.ChildPurchaseService1,
            specialRequests.ChildPurchaseService2,
            specialRequests.English,
            specialRequests.ChildSingleSelect1,
            specialRequests.ChildSingleSelect2,
            specialRequests.ChildSingleSelect3,
          ];
          break;
        }
        case serviceTypeMap.TW.MPV: {
          validSpecialRequest = [
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.HelpBuy,
            specialRequests.RequireLift,
            specialRequests.LalabagSUV,
            specialRequests.ChildMultiSelect1,
            specialRequests.ChildMultiSelect2,
            specialRequests.ChildMultiSelect3,
            specialRequests.ChildMultiSelect4,
            specialRequests.ChildMultiSelect5,
            specialRequests.ChildMultiSelect6,
            specialRequests.ChildMultiSelect7,
            specialRequests.ChildMultiSelect8,
            specialRequests.ChildMultiSelect9,
            specialRequests.ChildMultiSelect10,
          ];
          break;
        }
        case serviceTypeMap.TW.VAN: {
          validSpecialRequest = [
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.HelpBuy,
            specialRequests.RequireLift,
            specialRequests.thermalBag,
            specialRequests.Pets,
            specialRequests.ChildSingleSelect1,
            specialRequests.ChildSingleSelect2,
            specialRequests.ChildSingleSelect3,
          ];
          break;
        }
        case serviceTypeMap.TW.TRUCK175: {
          break;
        }
      }
      break;
    }
    case City.TW_TXG: {
      switch (serviceType) {
        case serviceTypeMap.TW.MOTORCYCLE: {
          validSpecialRequest = [
            specialRequests.Lalabag,
            specialRequests.HelpBuy,
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
          ];
          break;
        }
        case serviceTypeMap.TW.MPV: {
          validSpecialRequest = [
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.HelpBuy,
            specialRequests.RequireLift,
          ];
          break;
        }
        case serviceTypeMap.TW.VAN: {
          validSpecialRequest = [
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.HelpBuy,
            specialRequests.RequireLift,
          ];
          break;
        }
        case serviceTypeMap.TW.TRUCK175: {
          validSpecialRequest = [
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.SelfServedHouseMoving,
            specialRequests.MovingUpstairsWithElevator,
            specialRequests.MovingUpstairsWithoutElevator4to6F,
            specialRequests.Tailgate,
            specialRequests.Refrigerator,
            specialRequests.Freezer,
            specialRequests.PortageFee,
            specialRequests.ProfessionalHouseMoving,
            specialRequests.MovingUpstairsWithoutElevatorB1and2to3F,
          ];
          break;
        }
      }
      break;
    }
    case City.TW_KHH: {
      switch (serviceType) {
        case serviceTypeMap.TW.MOTORCYCLE: {
          validSpecialRequest = [
            specialRequests.HelpBuy,
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.Lalabag,
          ];
          break;
        }
        case serviceTypeMap.TW.MPV: {
          validSpecialRequest = [
            specialRequests.HelpBuy,
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.RequireLift,
          ];
          break;
        }
        case serviceTypeMap.TW.VAN: {
          validSpecialRequest = [
            specialRequests.HelpBuy,
            specialRequests.FragileGood,
            specialRequests.PaidByRecipient,
            specialRequests.RequireLift,
          ];
          break;
        }
        case serviceTypeMap.TW.TRUCK175: {
          validSpecialRequest = [
            specialRequests.PaidByRecipient,
            specialRequests.FragileGood,
            specialRequests.MovingUpstairsWithoutElevatorB1and2to3F,
            specialRequests.RequireLiftWithElevator,
            specialRequests.Tailgate,
            specialRequests.Refrigerator,
            specialRequests.Freezer,
            specialRequests.PortageFee,
            specialRequests.MovingUpstairsWithoutElevator4to6F,
          ];
          break;
        }
      }
      break;
    }
  }

  return specialRequestsFromRequest.filter((req) => validSpecialRequest.includes(req));
};

export class LalamoveException extends Error {
  constructor(status: number, data: object) {
    const json = data
      ? {
          status,
          ...data,
        }
      : {
          status,
        };
    super(JSON.stringify(json));
  }
}

export enum Reason {
  DRIVER_LATE = 'DRIVER_LATE',
  DRIVER_ASKED_CHANGE = 'DRIVER_ASKED_CHANGE',
  DRIVER_UNRESPONSIVE = 'DRIVER_UNRESPONSIVE',
  DRIVER_RUDE = 'DRIVER_RUDE',
}

const UTC_ZERO_TIMEZONE = 'Europe/London';

export class Lalamove {
  private apiInfo: ApiInfo; // all property related to lalamove API
  private baseUrl: string;
  private defaultTimeout: number;

  // Lalamove class constructor
  constructor({ baseUrl, apiKey, apiSecret, market, defaultTimeout = 10000 }: lalamove) {
    this.apiInfo = {
      market,
      apiKey,
      apiSecret,
    };
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  // create signature for lalamove access token
  private createSignature(rawForSignature: string, apiSecret: string) {
    return CryptoJS.HmacSHA256(rawForSignature, apiSecret).toString();
  }

  // do request with lalamove api
  private async request({ url, method, body = {} }: RequestInfo): Promise<any> {
    const { market, apiKey, apiSecret } = this.apiInfo;
    const bodyStr = method == HttpMethod.GET ? '' : JSON.stringify(body);

    const tokenGenerate = () => {
      const timestamp = getTime(new Date());
      // get signature from api config and request information
      const rawForSignature = `${timestamp}\r\n${method}\r\n${url}\r\n\r\n${bodyStr}`;
      const signature = this.createSignature(rawForSignature, apiSecret);
      const token = `${apiKey}:${timestamp}:${signature}`;
      return token;
    };

    // call lalamove and handle errors while response has error(s)
    let fetchResult: superagent.Response;
    try {
      switch (method) {
        case HttpMethod.GET:
          fetchResult = await superagent
            .get(`${this.baseUrl}${url}`)
            .set('Authorization', `hmac ${tokenGenerate()}`)
            .set('Market', market)
            .set('X-Request-ID', uuidv4())
            .set('Content-Type', 'application/json');
          break;
        case HttpMethod.POST:
          fetchResult = await superagent
            .post(`${this.baseUrl}${url}`)
            .set('Authorization', `hmac ${tokenGenerate()}`)
            .set('Market', market)
            .set('X-Request-ID', uuidv4())
            .set('Content-Type', 'application/json')
            .send(body);
          break;
        case HttpMethod.PUT:
          fetchResult = await superagent
            .put(`${this.baseUrl}${url}`)
            .send(body)
            .set('Authorization', `hmac ${tokenGenerate()}`)
            .set('Market', market)
            .set('X-Request-ID', uuidv4())
            .set('Content-Type', 'application/json');
          break;
        case HttpMethod.DELETE:
          fetchResult = await superagent
            .delete(`${this.baseUrl}${url}`)
            .send(body)
            .set('Authorization', `hmac ${tokenGenerate()}`)
            .set('Market', market)
            .set('X-Request-ID', uuidv4())
            .set('Content-Type', 'application/json');
          break;
      }
    } catch (error: any) {
      const status = error.status;
      const response: superagent.Response = error.response;

      throw new Error(
        JSON.stringify({
          status,
          description: response.text,
          body: response.body,
        }),
      );
    }
    const responseData = fetchResult.body.data;

    return responseData || {};
  }

  private dateStringProcess(date: Date) {
    const dateString = format(date, 'yyyy-MM-dd', {
      timeZone: UTC_ZERO_TIMEZONE,
    });
    const timeString = format(date, 'HH:mm:ss', {
      timeZone: UTC_ZERO_TIMEZONE,
    });

    return `${dateString}T${timeString}Z`;
  }

  getMarket() {
    return this.apiInfo.market;
  }

  setMarket(market: Market) {
    this.apiInfo.market = market;
  }

  async getQuote({
    serviceType,
    language,
    stops,
    scheduleAt,
    specialRequests = [],
    isRouteOptimized,
    item,
    cashOnDelivery,
    city,
  }: rawQuoteRequest): Promise<QuoteResponse> {
    const validSpecialRequests = getValidSpecialRequests({
      city,
      serviceType,
      specialRequestsFromRequest: specialRequests,
    });

    // create request body
    const requestBody: QuoteRequest = {
      serviceType,
      language,
      stops,
      specialRequests: validSpecialRequests,
      isRouteOptimized,
      item,
      cashOnDelivery,
      scheduleAt: scheduleAt && this.dateStringProcess(scheduleAt),
    };

    return this.request({
      url: '/v3/quotations',
      method: HttpMethod.POST,
      body: { data: requestBody },
    });
  }

  async placeOrder({
    quotationId,
    sender,
    recipients,
    isRecipientSMSEnabled,
    isPODEnabled,
    partner,
    metadata,
  }: OrderPlacementRequest): Promise<OrderPlacementResponse> {
    // create request body
    const requestBody = {
      quotationId,
      sender,
      recipients,
      isRecipientSMSEnabled,
      isPODEnabled,
      metadata,
      partner,
    };

    return this.request({
      url: '/v3/orders',
      method: HttpMethod.POST,
      body: { data: requestBody },
    });
  }

  async orderDetail(orderId: string): Promise<OrderDetailResponse> {
    return this.request({
      url: `/v3/orders/${orderId}`,
      method: HttpMethod.GET,
    });
  }

  /**
   *
   * This information is available starting 1 hour prior to datetime specified in scheduleAt datetime and remain accessible until the order is completed. Attempts made outside of this time window will get 403 Forbidden response.
   */
  async driverDetail(orderId: string, driverId: string): Promise<DriverDetailResponse> {
    return this.request({
      url: `/v3/orders/${orderId}/drivers/${driverId}`,
      method: HttpMethod.GET,
    });
  }

  async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
    return this.request({
      url: `/v3/orders/${orderId}`,
      method: HttpMethod.DELETE,
    });
  }

  /**
   *
   * after 15 mins can change driver
   */
  async changeDriver({
    orderId,
    driverId,
    reason,
  }: {
    orderId: string;
    driverId: string;
    reason: Reason;
  }) {
    const requestBody = { reason };
    return this.request({
      url: `/v3/orders/${orderId}/drivers/${driverId}`,
      method: HttpMethod.DELETE,
      body: { data: requestBody },
    });
  }

  async addPriorityFee(orderId: string, tips: number): Promise<AddPriorityFeeResponse> {
    const requestBody = { priorityFee: tips.toString() };
    return this.request({
      url: `/v3/orders/${orderId}/priority-fee`,
      method: HttpMethod.POST,
      body: { data: requestBody },
    });
  }

  async getCityInfo() {
    return this.request({
      url: '/v3/cities',
      method: HttpMethod.GET,
    });
  }
}
