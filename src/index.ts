import getTime from "date-fns/getTime";
import format from "date-fns-tz/format";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import * as superagent from "superagent";

export enum Country {
  TW_TPE = "TW_TPE",
  TW_TXG = "TW_TXG",
  TW_KHH = "TW_KHH",
}

// TODO: 現在不需指名國家跟城市，只要放market
export enum Market {
  TAIWAN = "TW",
  BRASIL = "BR",
  Hong_Kong = "HK",
  INDONESIA = "ID",
  MALAYSIA = "MY",
  MEXICO = "MX",
  PHILIPPINES = "PH",
  SINGAPORE = "SG",
  THAILAND = "TH",
  VIETNAM = "VN",
}

export enum LanguagesTW {
  zh_TW = "zh_TW",
}

export enum LanguagesHK {
  en_HK = "en_HK",
  zh_HK = "zh_HK",
}

export enum LanguagesBR {
  en_BR = "en_BR",
  pt_BR = "pt_BR",
}

export enum LanguagesID {
  en_ID = "en_ID",
  id_ID = "id_ID",
}

export enum LanguagesMY {
  en_MY = "en_MY",
  ms_MY = "ms_MY",
}

export enum LanguagesMX {
  en_MX = "en_MX",
  es_MX = "es_MX",
}

export enum LanguagesPH {
  en_PH = "en_PH",
}

export enum LanguagesSG {
  en_SG = "en_SG",
}

export enum LanguagesTH {
  th_TH = "th_TH",
  en_TH = "en_TH",
}

export enum LanguagesVN {
  en_VN = "en_VN",
  vi_VN = "vi_VN",
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export enum ServiceTypeTW {
  MOTORCYCLE = "MOTORCYCLE",
  MPV = "MPV",
  VAN = "VAN",
  TRUCK175 = "TRUCK175",
}

export enum SpecialRequestTW {
  FRAGILE_GOODS = "FRAGILE_GOODS",
  THERMAL_BAG_1 = "THERMAL_BAG_1",
  PURCHASE_SERVICE_1 = "PURCHASE_SERVICE_1",
  PURCHASE_SERVICE_2 = "PURCHASE_SERVICE_2",
  PURCHASE_SERVICE_3 = "PURCHASE_SERVICE_3",
  PETS = "PETS",
  ENGLISH = "ENGLISH",
  TOLL_FEE_1 = "TOLL_FEE_1",
  TOLL_FEE_2 = "TOLL_FEE_2",
  TOLL_FEE_3 = "TOLL_FEE_3",
}

export enum LalamoveOrderStatus {
  ASSIGNING_DRIVER = "ASSIGNING_DRIVER",
  ON_GOING = "ON_GOING",
  PICKED_UP = "PICKED_UP",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELED",
  EXPIRED = "EXPIRED",
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

export type requestInfo = {
  url: string;
  method: HttpMethod;
  body?: object;
};

export type ServiceType = {
  TW_TPE: ServiceTypeTW;
  TW_TXG: ServiceTypeTW;
  TW_KHH: ServiceTypeTW;
};

export type Location = {
  lat: number;
  lng: number;
};

export type Distance = {
  value: string;
  unit: string;
};

export type Address = {
  displayString: string;
  country?: Country;
};

export type WayPoint = {
  location: Location;
  addresses: { [languageCode in Languages[Market]]?: Address };
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

// TODO: other market its SpecialRequest
export type SpecialRequest = {
  [Market.TAIWAN]: SpecialRequests;
  [Market.BRASIL]: SpecialRequests;
  [Market.Hong_Kong]: SpecialRequests;
  [Market.INDONESIA]: SpecialRequests;
  [Market.MALAYSIA]: SpecialRequests;
  [Market.MEXICO]: SpecialRequests;
  [Market.PHILIPPINES]: SpecialRequests;
  [Market.SINGAPORE]: SpecialRequests;
  [Market.THAILAND]: SpecialRequests;
  [Market.VIETNAM]: SpecialRequests;
};

export type DeliveryStop = {
  stopId: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
};

export type CashOnDelivery = {
  amount: string;
};

export type quoteRequest = {
  serviceType: ServiceType[Country];
  language: Languages[Market];
  stops: Array<Omit<DeliveryStop, "stopId">>;
  scheduleAt?: Date; // UTC ISO8601 format
  specialRequests?: Array<SpecialRequest[Market]>;
  isRouteOptimized?: boolean; // multiple drop off
  item?: Item;
  cashOnDelivery?: CashOnDelivery;
};

export enum Weight {
  LESS_THAN_3KG = "LESS_THAN_3KG",
}

export enum Category {
  FOOD_DELIVERY = "FOOD_DELIVERY",
  OFFICE_ITEM = "OFFICE_ITEM",
}

export enum HandlingInstructions {
  KEEP_UPRIGHT = "KEEP_UPRIGHT",
  FRAGILE = "FRAGILE",
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

export type orderPlacementRequest = {
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

export type quoteResponse = {
  quotationId: string;
  scheduleAt: string;
  serviceType: ServiceTypeTW;
  specialRequests?: Array<SpecialRequest[Market]>;
  expiresAt: string; // 5 mins
  priceBreakdown: priceBreakdown;
  stops: Array<Stop>;
  item?: Item;
};

export type priceBreakdown = {
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
  PENDING = "PENDING",
  DELIVERED = "DELIVERED",
  SIGNED = "SIGNED",
  FAILED = "FAILED",
}

export type Stop = DeliveryStop & {
  name?: string;
  phone?: string;
  POD?: {
    status: PODStauts;
    image: string;
    deliveredAt: string;
  };
};

export type orderPlacementResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: priceBreakdown;
  priorityFee?: string;
  driverId: string;
  shareLink: string;
  status: LalamoveOrderStatus;
  distance: Distance;
  stops: Array<Stop>;
  metadata: Record<string, any>;
  cashOnDelivery: CashOnDelivery;
};

export type orderDetailResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: priceBreakdown;
  priorityFee: string;
  status: LalamoveOrderStatus;
  cashOnDelivery: CashOnDelivery;
  driverId: string;
  shareLink: string;
  distance: Distance;
  stops: Array<Stop>;
  metadata: Record<string, any>;
};

export type driverDetailResponse = {
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

export type driverLocationResponse = {
  location: {
    lat: string;
    lng: string;
  };
  updatedAt: string;
};

export type cancelOrderResponse = object;

export type addPriorityFeeResponse = {
  orderId: string;
  quotationId: string;
  priceBreakdown: priceBreakdown;
  shareLink: string;
  driverId: string;
  status: LalamoveOrderStatus;
  distance: Distance;
  stops: Array<Stop>;
};

export const serviceType: {
  TW_TPE: { [serviceTypeKey in ServiceTypeTW]: ServiceTypeTW };
  TW_TXG: { [serviceTypeKey in ServiceTypeTW]: ServiceTypeTW };
  TW_KHH: { [serviceTypeKey in ServiceTypeTW]: ServiceTypeTW };
} = {
  TW_TPE: {
    MOTORCYCLE: ServiceTypeTW.MOTORCYCLE,
    MPV: ServiceTypeTW.MPV,
    VAN: ServiceTypeTW.VAN,
    TRUCK175: ServiceTypeTW.TRUCK175,
  },
  TW_TXG: {
    MOTORCYCLE: ServiceTypeTW.MOTORCYCLE,
    MPV: ServiceTypeTW.MPV,
    VAN: ServiceTypeTW.VAN,
    TRUCK175: ServiceTypeTW.TRUCK175,
  },
  TW_KHH: {
    MOTORCYCLE: ServiceTypeTW.MOTORCYCLE,
    MPV: ServiceTypeTW.MPV,
    VAN: ServiceTypeTW.VAN,
    TRUCK175: ServiceTypeTW.TRUCK175,
  },
};

// TODO: add other market SpecialRequests
export type SpecialRequests = SpecialRequestTW;

export const specialRequestMap = {
  [Market.TAIWAN]: SpecialRequestTW,
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
  DRIVER_LATE = "DRIVER_LATE",
  DRIVER_ASKED_CHANGE = "DRIVER_ASKED_CHANGE",
  DRIVER_UNRESPONSIVE = "DRIVER_UNRESPONSIVE",
  DRIVER_RUDE = "DRIVER_RUDE",
}

const UTC_ZERO_TIMEZONE = "Europe/London";

export class Lalamove {
  private apiInfo: ApiInfo; // all property related to lalamove API
  private baseUrl: string;
  private defaultTimeout: number;

  // Lalamove class constructor
  constructor({
    baseUrl,
    apiKey,
    apiSecret,
    market,
    defaultTimeout = 10000,
  }: lalamove) {
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
  private async request({ url, method, body = {} }: requestInfo): Promise<any> {
    const { market, apiKey, apiSecret } = this.apiInfo;
    const bodyStr = method == HttpMethod.GET ? "" : JSON.stringify(body);

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
            .set("Authorization", `hmac ${tokenGenerate()}`)
            .set("Market", market)
            .set("X-Request-ID", uuidv4())
            .set("Content-Type", "application/json");
          break;
        case HttpMethod.POST:
          fetchResult = await superagent
            .post(`${this.baseUrl}${url}`)
            .set("Authorization", `hmac ${tokenGenerate()}`)
            .set("Market", market)
            .set("X-Request-ID", uuidv4())
            .set("Content-Type", "application/json")
            .send(body);
          break;
        case HttpMethod.PUT:
          fetchResult = await superagent
            .put(`${this.baseUrl}${url}`)
            .send(body)
            .set("Authorization", `hmac ${tokenGenerate()}`)
            .set("Market", market)
            .set("X-Request-ID", uuidv4())
            .set("Content-Type", "application/json");
          break;
        case HttpMethod.DELETE:
          fetchResult = await superagent
            .delete(`${this.baseUrl}${url}`)
            .send(body)
            .set("Authorization", `hmac ${tokenGenerate()}`)
            .set("Market", market)
            .set("X-Request-ID", uuidv4())
            .set("Content-Type", "application/json");
          break;
      }
    } catch (error: any) {
      const status = error.status;
      const response: superagent.Response = error.response;

      throw new Error(
        JSON.stringify({
          error,
          // status
          // description: response.text,
          // body: response.body,
        })
      );
    }
    const responseData = fetchResult.body.data;

    return responseData || {};
  }

  private dateStringProcess(date: Date) {
    const dateString = format(date, "yyyy-MM-dd", {
      timeZone: UTC_ZERO_TIMEZONE,
    });
    const timeString = format(date, "HH:mm:ss", {
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
    specialRequests,
    isRouteOptimized,
    item,
    cashOnDelivery,
  }: quoteRequest): Promise<quoteResponse> {
    // create request body
    const requestBody: Omit<quoteRequest, "scheduleAt"> & {
      scheduleAt?: string;
    } = {
      serviceType,
      language,
      stops,
      specialRequests,
      isRouteOptimized,
      item,
      cashOnDelivery,
      scheduleAt: scheduleAt && this.dateStringProcess(scheduleAt),
    };

    return this.request({
      url: "/v3/quotations",
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
  }: orderPlacementRequest): Promise<orderPlacementResponse> {
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
      url: "/v3/orders",
      method: HttpMethod.POST,
      body: { data: requestBody },
    });
  }

  async orderDetail(orderId: string): Promise<orderDetailResponse> {
    return this.request({
      url: `/v3/orders/${orderId}`,
      method: HttpMethod.GET,
    });
  }

  /**
   *
   * This information is available starting 1 hour prior to datetime specified in scheduleAt datetime and remain accessible until the order is completed. Attempts made outside of this time window will get 403 Forbidden response.
   */
  async driverDetail(
    orderId: string,
    driverId: string
  ): Promise<driverDetailResponse> {
    return this.request({
      url: `/v3/orders/${orderId}/drivers/${driverId}`,
      method: HttpMethod.GET,
    });
  }

  async cancelOrder(orderId: string): Promise<cancelOrderResponse> {
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

  async addPriorityFee(
    orderId: string,
    tips: number
  ): Promise<addPriorityFeeResponse> {
    const requestBody = { priorityFee: tips.toString() };
    return this.request({
      url: `/v3/orders/${orderId}/priority-fee`,
      method: HttpMethod.POST,
      body: { data: requestBody },
    });
  }
}
