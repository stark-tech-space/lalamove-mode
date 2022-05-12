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
 *  Need city and serviceType to filter valid SpecialRequests
 */
export type RawQuoteRequest = Omit<QuoteRequest, 'scheduleAt'> & {
  city: City;
  scheduleAt?: Date;
};

export type QuoteRequest = {
  serviceType: ServiceType;
  language: Languages[Market];
  stops: Array<DeliveryStop>;
  scheduleAt?: string; // UTC ISO8601 format
  SpecialRequests?: Array<SpecialRequests>;
  isRouteOptimized?: boolean; // multiple drop off
  item?: Item;
  cashOnDelivery?: CashOnDelivery;
};

export enum Weight {
  LESS_THAN_3KG = 'LESS_THAN_3KG',
  W1KG_TO_1KG = '0-1',
  W1KG_TO_2KG = '1-2',
  W2KG_TO_3KG = '2-3',
  W3KG_TO_4KG = '3-4',
  W4KG_TO_5KG = '4-5',
  W5KG_TO_6KG = '5-6',
}

export type WeightTW = Exclude<Weight, Weight.LESS_THAN_3KG>;

export enum Category {
  FOOD_DELIVERY = 'FOOD_DELIVERY',
  OFFICE_ITEM = 'OFFICE_ITEM',
  Spaghetti = 'Spaghetti',
  Hotdog = 'Hotdog',
  Burger = 'Burger',
  FriedChicken = 'Fried Chicken',
  Chicharon = 'Chicharon',
  Tapa = 'Tapa',
}

export type CategoryTW = Exclude<Category, Category.FOOD_DELIVERY | Category.OFFICE_ITEM>;

export enum HandlingInstructions {
  KEEP_UPRIGHT = 'KEEP_UPRIGHT',
  FRAGILE = 'Fragile',
  KeepDry = 'Keep dry',
}
export type HandlingInstructionsTW = Extract<
  HandlingInstructions,
  HandlingInstructions.FRAGILE | HandlingInstructions.KeepDry
>;

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

/**
 * @param quotationId use getQuote to get quotationId in response body
 * @param sender This information will be displayed to the driver.
 * @param recipients An array of DeliveryDetails, containing recipient contact and instruction per stop
 * @param isRecipientSMSEnabled (optional) Send delivery updates via SMS to THE recipient, or the recipient of the LAST STOP for multi-stop orders once the order has been picked-up by the driver.
Default to true
 * @param isPODEnabled Request driver to carry out "Proof Of Delivery" for all stops in the order. Default to false
 * @param partner (optional) Specify Partner's name for effective tracking and organization. This field is only applicable for channel partners. Please contact partner.support@lalamove.com if you would like to request for your Partner ID
 * @param metadata (optional) An object with key-value pairs containing client-specific information
 */
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

/**
 * @param quotationId need to send for place order request
 * @param scheduleAt Pick up time in UTC timezone and ISO 8601 format
 * @param priceBreakdown
 * @param expiresAt display date string. (5 mins)
 * @param item optional but recommend to have
 * @param SpecialRequests optional
 */
export type QuoteResponse = {
  quotationId: string;
  scheduleAt: string;
  serviceType: ServiceTypeTW;
  SpecialRequests?: Array<SpecialRequests>;
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

export enum SpecialRequests {
  LALABAG = 'THERMAL_BAG_1',
  HELP_BUY = 'PURCHASE_SERVICE_1',
  FRAGILE_GOODS = 'FRAGILE_GOODS',
  CHILD_PURCHASE_SERVICE_1 = 'PURCHASE_SERVICE_2',
  CHILD_PURCHASE_SERVICE_2 = 'PURCHASE_SERVICE_3',
  ENGLISH = 'ENGLISH',
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
  PAID_BY_RECIPIENT = 'CASH_ON_DELIVERY',
  REQUIRE_LIFT = 'MOVING_GOODS_UPSTAIR_REQUIRE_LIFT',
  THERMAL_BAG = 'THERMAL_BAG_1',
  PETS = 'PETS',

  TAILBOARD = 'TAILBOARD',
  REFRIGERATOR = 'REFRIGERATED_UV_1',
  FREEZER = 'REFRIGERATED_UV_2',
  SELF_SERVED_HOUSE_MOVING = 'MOVING_SERVICE',
  PROFESSIONAL_HOUSE_MOVING = 'MOVING_SERVICE_1',
  MOVING_UPSTAIRS_WITHOUT_ELEVATOR_2_TO_3F = 'MOVING_SERVICE_2',
  MOVING_UPSTAIRS_WITHOUT_ELEVATOR_4_TO_6F = 'MOVING_SERVICE_3',
  PORTAGE_FEE = 'MOVING_SERVICE_4',
}

const getValidSpecialRequests = ({
  city,
  serviceType,
  specialRequestsFromRequest = [],
}: {
  serviceType: ServiceType;
  city: City;
  specialRequestsFromRequest: Array<SpecialRequests>;
}) => {
  let validSpecialRequest: Array<SpecialRequests> = [];
  switch (city) {
    case City.TW_TPE: {
      switch (serviceType) {
        case SERVICE_TYPE_MAP.TW.MOTORCYCLE: {
          validSpecialRequest = [
            SpecialRequests.LALABAG,
            SpecialRequests.HELP_BUY,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.CHILD_PURCHASE_SERVICE_1,
            SpecialRequests.CHILD_PURCHASE_SERVICE_2,
            SpecialRequests.ENGLISH,
            SpecialRequests.ChildSingleSelect1,
            SpecialRequests.ChildSingleSelect2,
            SpecialRequests.ChildSingleSelect3,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.MPV: {
          validSpecialRequest = [
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.HELP_BUY,
            SpecialRequests.REQUIRE_LIFT,
            SpecialRequests.LALABAG,
            SpecialRequests.ChildMultiSelect1,
            SpecialRequests.ChildMultiSelect2,
            SpecialRequests.ChildMultiSelect3,
            SpecialRequests.ChildMultiSelect4,
            SpecialRequests.ChildMultiSelect5,
            SpecialRequests.ChildMultiSelect6,
            SpecialRequests.ChildMultiSelect7,
            SpecialRequests.ChildMultiSelect8,
            SpecialRequests.ChildMultiSelect9,
            SpecialRequests.ChildMultiSelect10,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.VAN: {
          validSpecialRequest = [
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.HELP_BUY,
            SpecialRequests.REQUIRE_LIFT,
            SpecialRequests.THERMAL_BAG,
            SpecialRequests.PETS,
            SpecialRequests.ChildSingleSelect1,
            SpecialRequests.ChildSingleSelect2,
            SpecialRequests.ChildSingleSelect3,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.TRUCK175: {
          break;
        }
      }
      break;
    }
    case City.TW_TXG: {
      switch (serviceType) {
        case SERVICE_TYPE_MAP.TW.MOTORCYCLE: {
          validSpecialRequest = [
            SpecialRequests.LALABAG,
            SpecialRequests.HELP_BUY,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.MPV: {
          validSpecialRequest = [
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.HELP_BUY,
            SpecialRequests.REQUIRE_LIFT,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.VAN: {
          validSpecialRequest = [
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.HELP_BUY,
            SpecialRequests.REQUIRE_LIFT,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.TRUCK175: {
          validSpecialRequest = [
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.SELF_SERVED_HOUSE_MOVING,
            SpecialRequests.REQUIRE_LIFT,
            SpecialRequests.MOVING_UPSTAIRS_WITHOUT_ELEVATOR_4_TO_6F,
            SpecialRequests.TAILBOARD,
            SpecialRequests.REFRIGERATOR,
            SpecialRequests.FREEZER,
            SpecialRequests.PORTAGE_FEE,
            SpecialRequests.PROFESSIONAL_HOUSE_MOVING,
            SpecialRequests.MOVING_UPSTAIRS_WITHOUT_ELEVATOR_2_TO_3F,
          ];
          break;
        }
      }
      break;
    }
    case City.TW_KHH: {
      switch (serviceType) {
        case SERVICE_TYPE_MAP.TW.MOTORCYCLE: {
          validSpecialRequest = [
            SpecialRequests.HELP_BUY,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.LALABAG,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.MPV: {
          validSpecialRequest = [
            SpecialRequests.HELP_BUY,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.REQUIRE_LIFT,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.VAN: {
          validSpecialRequest = [
            SpecialRequests.HELP_BUY,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.REQUIRE_LIFT,
          ];
          break;
        }
        case SERVICE_TYPE_MAP.TW.TRUCK175: {
          validSpecialRequest = [
            SpecialRequests.PAID_BY_RECIPIENT,
            SpecialRequests.FRAGILE_GOODS,
            SpecialRequests.MOVING_UPSTAIRS_WITHOUT_ELEVATOR_2_TO_3F,
            SpecialRequests.REQUIRE_LIFT,
            SpecialRequests.TAILBOARD,
            SpecialRequests.REFRIGERATOR,
            SpecialRequests.FREEZER,
            SpecialRequests.PORTAGE_FEE,
            SpecialRequests.MOVING_UPSTAIRS_WITHOUT_ELEVATOR_4_TO_6F,
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
    SpecialRequests = [],
    isRouteOptimized,
    item,
    cashOnDelivery,
    city,
  }: RawQuoteRequest): Promise<QuoteResponse> {
    const validSpecialRequests = getValidSpecialRequests({
      city,
      serviceType,
      specialRequestsFromRequest: SpecialRequests,
    });

    // create request body
    const requestBody: QuoteRequest = {
      serviceType,
      language,
      stops,
      SpecialRequests: validSpecialRequests,
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
