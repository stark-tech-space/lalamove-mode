import getTime from 'date-fns/getTime';
import format from 'date-fns-tz/format';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import * as superagent from 'superagent';

export enum Market {
  TAIWAN = 'TW',
  BRASIL = 'BR',
  HONGKONG = 'HK',
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
  // TW_KNH = 'TW_KNH', not support yet
  TW_TNN = 'TW_TNN',
}

export enum LanguagesTW {
  ZH_TW = 'zh_TW',
}

export enum LanguagesHK {
  EN_HK = 'en_HK',
  ZH_HK = 'zh_HK',
}

export enum LanguagesBR {
  EN_BR = 'en_BR',
  PT_BR = 'pt_BR',
}

export enum LanguagesID {
  EN_ID = 'en_ID',
  ID_ID = 'id_ID',
}

export enum LanguagesMY {
  EN_MY = 'en_MY',
  MS_MY = 'ms_MY',
}

export enum LanguagesMX {
  EN_MX = 'en_MX',
  ES_MX = 'es_MX',
}

export enum LanguagesPH {
  EN_PH = 'en_PH',
}

export enum LanguagesSG {
  en_SG = 'en_SG',
}

export enum LanguagesTH {
  TH_TH = 'th_TH',
  EN_TH = 'en_TH',
}

export enum LanguagesVN {
  EN_VN = 'en_VN',
  VI_VN = 'vi_VN',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ServiceTypeTW {
  MOTORCYCLE = 'MOTORCYCLE',
  VAN = 'VAN',
  TRUCK175 = 'TRUCK175',
  SUV = 'SUV',
  TRUCK330 = 'TRUCK330',
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
  [Market.HONGKONG]: LanguagesHK;
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
export const SERVICE_TYPE_MAP = {
  [Market.TAIWAN]: ServiceTypeTW,
  [Market.BRASIL]: ServiceTypeTW,
  [Market.HONGKONG]: ServiceTypeTW,
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

export type DeliveryStop = {
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
};

export type RawDeliveryStop = Omit<DeliveryStop, 'coordinates'> & {
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type DeliveryStopWithId = DeliveryStop & {
  stopId: string;
};

export type CashOnDelivery = {
  amount: string;
};

/**
 * scheduleAt is Date but in the end need to covert to string.
 *  Need city and serviceType to filter valid SpecialRequest
 */
export type RawQuoteRequest = Omit<QuoteRequest, 'scheduleAt' | 'stops'> & {
  scheduleAt?: Date;
  stops: Array<RawDeliveryStop>;
};

export type QuoteRequest = {
  serviceType: ServiceType;
  language: Languages[Market];
  stops: Array<DeliveryStop>;
  scheduleAt?: string; // UTC ISO8601 format
  specialRequests?: Array<SpecialRequest>;
  isRouteOptimized?: boolean; // multiple drop off
  item?: Item;
  cashOnDelivery?: CashOnDelivery;
};

/**
 * in production not offer Weight to choose yet (TW). plz send empty string
 */
export enum Weight {}

/**
 * in production not offer category to choose yet (TW). plz send empty array
 */
export enum Category {}

export enum HandlingInstructions {
  FRAGILE = 'Fragile',
  KEEP_DRY = 'Keep dry',
}

export type Item = {
  quantity: string;
  weight: Weight | '';
  categories: Array<Category>;
  handlingInstructions: Array<HandlingInstructions>;
};

export type DeliveryDetails = {
  stopId: string;
  name: string;
  phone: string;
  remarks?: string;
};

/**
 * @param quotationId use getQuote to get quotationId in response body
 * @param sender  name, phone, stopId  .This information will be displayed to the driver.
 * @param recipients. array of  stopId, name, phone, remarks(optional)  An array of DeliveryDetails, containing recipient contact and instruction per stop
 * @param isRecipientSMSEnabled (optional) Send delivery updates via SMS to THE recipient, or the recipient of the LAST STOP for multi-stop orders once the order has been picked-up by the driver.
Default to true
 * @param isPODEnabled Request driver to carry out "Proof Of Delivery" for all stops in the order. Default to false
 * @param partner (optional) Specify Partner's name for effective tracking and organization. This field is only applicable for channel partners. Please contact partner.support@lalamove.com if you would like to request for your Partner ID
 * @param metadata (optional) An object with key-value pairs containing client-specific information
 */
export type OrderPlacementRequest = {
  quotationId: string;
  sender: Contact & {
    stopId: string;
  };
  recipients: Array<DeliveryDetails>;
  isRecipientSMSEnabled?: boolean;
  isPODEnabled?: boolean;
  partner?: string;
  metadata?: Record<string, any>;
};

/**
 * @param quotationId need to send for place order request
 * @param scheduleAt Pick up time in UTC timezone and ISO 8601 format
 * @param priceBreakdown
 * @param expiresAt display date string. (5 mins)
 * @param item optional but recommend to have
 * @param SpecialRequest optional
 */
export type QuoteResponse = {
  quotationId: string;
  scheduleAt: string;
  serviceType: ServiceTypeTW;
  SpecialRequest?: Array<SpecialRequest>;
  expiresAt: string; // 5 mins
  priceBreakdown: PriceBreakdown;
  stops: Array<Stop>;
  item?: Item;
};

/**
 * Breakdown of the delivery price
 * @param base
 * @param extraMileage
 * @param surcharge
 * @param priorityFee optional
 * @param total
 * @param totalBeforeOptimization
 * @param totalExcludePriorityFee
 * @param currency ex: THB
 */
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

/**
 * POD = poof of delivery
 * @param PENDING The driver hasn't completed the delivery to the stop yet
 * @param DELIVERED The driver has completed the order and has taken a photo at the stop
 * @param SIGNED The driver has completed the order and received recipient's signature
 * @param FAILED The driver couldn't complete the delivery to the stop
 */
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

/**
 * @param driverId <LALAMOVE_DRIVER_ID>
 * @param name Name of the driver
 * @param phone Phone number of the driver. To be encrypted in the future for privacy
 * @param plateNumber License plate of the driver's vehicle. First two digits and the last digit is masked with asterisk for privacy
 * @param coordinates Last updated location of the driver
 */
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

export enum SpecialRequest {
  EXTRA_WAITING_TIME = 'PARENT_EXTRA_TIME',
  EXTRA_WAITING_1HR = 'WAITING_TIME_1',
  EXTRA_WAITING_2HR = 'WAITING_TIME_2',
  LALABAG = 'THERMAL_BAG_1',
  HELP_BUY = 'PURCHASE_SERVICE_1',
  FRAGILE_GOODS = 'FRAGILE_GOODS',
  MOVING_UPSTAIRS = 'PARENT_MOVING_SERVICE',
  PAID_BY_RECIPIENT = 'CASH_ON_DELIVERY',
  REQUIRE_LIFT = 'MOVING_GOODS_UPSTAIR_REQUIRE_LIFT',

  TAILBOARD = 'TAILBOARD',
  REFRIGERATOR = 'REFRIGERATED_UV_1',
  FREEZER = 'REFRIGERATED_UV_2',
  SELF_SERVED_HOUSE_MOVING = 'MOVING_SERVICE',
  PROFESSIONAL_HOUSE_MOVING = 'MOVING_SERVICE_1',
  MOVING_UPSTAIRS_WITHOUT_ELEVATOR_B1_AND_2_TO_3F = 'MOVING_SERVICE_2',
  MOVING_UPSTAIRS_WITHOUT_ELEVATOR_4_TO_6F = 'MOVING_SERVICE_3',
  PORTAGE_FEE = 'MOVING_SERVICE_4',
}

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

  private stopTransform(stops: RawDeliveryStop): DeliveryStop {
    let {
      coordinates: { lng, lat },
    } = stops;

    return {
      ...stops,
      coordinates: {
        lat: lat.toString(),
        lng: lng.toString(),
      },
    };
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
  }: RawQuoteRequest): Promise<QuoteResponse> {
    // create request body
    const requestBody: QuoteRequest = {
      serviceType,
      language,
      stops: stops.map((stop) => this.stopTransform(stop)),
      specialRequests,
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
