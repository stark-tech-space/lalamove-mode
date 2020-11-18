import getTime from 'date-fns/fp/getTime';
import format from 'date-fns-tz/format';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import phin from 'phin';

export enum Country {
	TW = 'TW',
}

export enum LanguagesTW {
	zh_TW = 'zh_TW',
}

export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
}

export enum ServiceTypeTW {
	MOTORCYCLE = 'MOTORCYCLE',
	MPV = 'MPV',
	VAN = 'VAN',
	TRUCK175 = 'TRUCK175',
	TRUCK330 = 'TRUCK330',
}

export enum SpecialRequestTW {
	LALABAG = 'LALABAG',
	HELP_BUY = 'HELP_BUY',
}

export enum LalamoveOrderStatus {
	ASSIGNING_DRIVER = 'ASSIGNING_DRIVER',
	ON_GOING = 'ON_GOING',
	PICKED_UP = 'PICKED_UP',
	COMPLETED = 'COMPLETED',
	REJECTED = 'REJECTED',
	CANCELLED = 'CANCELLED',
	EXPIRED = 'EXPIRED',
}

export type lalamove = {
	baseUrl: string;
	apiKey: string;
	apiSecret: string;
	country: Country;
	defaultTimeout?: number;
};

export type ApiInfo = {
	country: Country;
	apiKey: string;
	apiSecret: string;
};

export type Languages = {
	TW: LanguagesTW;
};

export type requestInfo = {
	url: string;
	method: HttpMethod;
	body?: object;
};

export type ServiceType = {
	TW: ServiceTypeTW;
};

export type Location = {
	lat: number;
	lng: number;
};

export type Address = {
	displayString: string;
	country?: Country;
};

export type WayPoint = {
	location: Location;
	addresses: { [languageCode in Languages[Country]]?: Address };
};

export type Contact = {
	name: string;
	phone: string;
};

export type DeliveryInfo = {
	stopIndex: number;
	receiver: Contact;
	remarks: { [key: string]: string };
};

export type SpecialRequest = {
	TW: SpecialRequestTW[];
};

export type quoteRequest = {
	serviceType: ServiceType[Country];
	destinations: WayPoint[];
	deliveryInfo: DeliveryInfo[];
	sender: Contact;
	scheduleAt: Date;
	specialRequest: SpecialRequest[Country];
};

export interface orderPlacementRequest extends quoteRequest {
	totalFee: {
		amount: string;
		currency: string;
	};
	smsForReceiver: boolean;
}

export type quoteResponse = {
	totalFee: string;
	totalFeeCurrency: string;
};

export type orderPlacementResponse = {
	customerOrderId: string;
	orderRef: string;
};

export type orderDetailResponse = {
	status: LalamoveOrderStatus;
	price: {
		amount: string;
		currency: string;
	};
	driverId: string;
};

export type driverDetailResponse = {
	name: string;
	phone: string;
	plateNumber: string;
	photo: string;
};

export type driverLocationResponse = {
	location: {
		lat: string;
		lng: string;
	};
	updatedAt: string;
};

export type cancelOrderResponse = object;

export const serviceType: {
	TW: { [serviceTypeKey in ServiceTypeTW]: ServiceTypeTW };
} = {
	TW: {
		MOTORCYCLE: ServiceTypeTW.MOTORCYCLE,
		MPV: ServiceTypeTW.MPV,
		VAN: ServiceTypeTW.VAN,
		TRUCK175: ServiceTypeTW.TRUCK175,
		TRUCK330: ServiceTypeTW.TRUCK330,
	},
};

export const specialRequest: {
	TW: { [specialRequestKey in SpecialRequestTW]: SpecialRequestTW };
} = {
	TW: {
		HELP_BUY: SpecialRequestTW.HELP_BUY,
		LALABAG: SpecialRequestTW.LALABAG,
	},
};

export class LalamoveException extends Error {
	constructor(status: number, data: object) {
		super(`http status: ${status}, data: ${JSON.stringify(data)}`);
	}
}

const UTC_ZERO_TIMEZONE = 'Europe/London';

export class Lalamove {
	private apiInfo: ApiInfo; // all property related to lalamove API
	private baseUrl: string;
	private defaultTimeout: number;

	// Lalamove class constructor
	constructor({
		baseUrl,
		apiKey,
		apiSecret,
		country,
		defaultTimeout = 10000,
	}: lalamove) {
		this.apiInfo = {
			country,
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
		const { country, apiKey, apiSecret } = this.apiInfo;

		const tokenGenerate = () => {
			const timestamp = getTime(new Date());
			// get signature from api config and request information
			const rawForSignature = `${timestamp}\r\n${method}\r\n${url}\r\n\r\n${JSON.stringify(
				body
			)}`;
			const signature = this.createSignature(rawForSignature, apiSecret);
			const token = `${apiKey}:${timestamp}:${signature}`;
			return token;
		};

		// use request mapping callback function object to replace if...else... statement
		const headers = () => {
			return {
				Authorization: `hmac ${tokenGenerate()}`,
				'X-LLM-Country': country,
				'X-Request-ID': uuidv4(),
				'Content-Type': 'application/json',
			};
		};

		// call lalamove and handle errors while response has error(s)
		const fetchResult: phin.IResponse = await phin({
			url: `${this.baseUrl}${url}`,
			method: method,
			data: JSON.stringify(body),
			headers: headers(),
			timeout: this.defaultTimeout,
		});

		// transform result from raw body string to JSON object
		let response: object;
		try {
			response = JSON.parse(fetchResult.body);
		} catch (error) {
			console.log('json transform error: ', error);
			response = {};
		}

		if (!fetchResult.statusCode) {
			// no response => unexpected error
			throw new LalamoveException(-1, {
				message: 'Unexpected Error',
			});
		} else if (fetchResult.statusCode < 200 || fetchResult.statusCode >= 400) {
			// http status code for error
			throw new LalamoveException(fetchResult.statusCode, response);
		}

		return response;
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

	getCountry() {
		return this.apiInfo.country;
	}

	setCountry(country: Country) {
		this.apiInfo.country = country;
	}

	private stopTransform(stop: WayPoint) {
		const { location, addresses } = stop;
		if (!addresses.zh_TW) {
			throw new LalamoveException(400, {
				message: 'addresses with "zh_TW" doesn\'t exist',
			});
		}

		addresses.zh_TW.country = this.apiInfo.country;
		return {
			location: {
				lat: location.lat.toString(),
				lng: location.lng.toString(),
			},
			addresses,
		};
	}

	async getQuote({
		serviceType,
		destinations,
		deliveryInfo,
		sender,
		scheduleAt,
		specialRequest,
	}: quoteRequest): Promise<quoteResponse> {
		// create request body
		const requestBody = {
			serviceType,
			stops: destinations.map(this.stopTransform.bind(this)),
			deliveries: deliveryInfo.map(({ stopIndex, receiver, remarks }) => {
				return {
					toStop: stopIndex,
					toContact: receiver,
					// generate remarks string
					remarks: Object.keys(remarks).reduce((acc, remarkKey) => {
						const remark = remarks[remarkKey];
						return `${acc}\r\n${remarkKey}: ${remark}`;
					}, ''),
				};
			}),
			requesterContact: sender,
			scheduleAt: this.dateStringProcess(scheduleAt),
			specialRequests: specialRequest,
		};

		return this.request({
			url: '/v2/quotations',
			method: HttpMethod.POST,
			body: requestBody,
		});
	}

	async placeOrder({
		serviceType,
		destinations,
		deliveryInfo,
		sender,
		scheduleAt,
		specialRequest,
		totalFee,
		smsForReceiver,
	}: orderPlacementRequest): Promise<orderPlacementResponse> {
		// create request body
		const requestBody = {
			serviceType,
			stops: destinations.map(this.stopTransform.bind(this)),
			deliveries: deliveryInfo.map(({ stopIndex, receiver, remarks }) => {
				return {
					toStop: stopIndex,
					toContact: receiver,
					// generate remarks string
					remarks: Object.keys(remarks).reduce((acc, remarkKey) => {
						const remark = remarks[remarkKey];
						return `${acc}\r\n${remarkKey}: ${remark}`;
					}, ''),
				};
			}),
			requesterContact: sender,
			scheduleAt: this.dateStringProcess(scheduleAt),
			specialRequest,
			quotedTotalFee: totalFee,
			sms: smsForReceiver,
		};

		return this.request({
			url: '/v2/orders',
			method: HttpMethod.POST,
			body: requestBody,
		});
	}

	async orderDetail(orderId: string): Promise<orderDetailResponse> {
		return this.request({
			url: `/v2/orders/${orderId}`,
			method: HttpMethod.GET,
		});
	}

	async driverDetail(
		orderId: string,
		driverId: string
	): Promise<driverDetailResponse> {
		return this.request({
			url: `/v2/orders/${orderId}/drivers/${driverId}`,
			method: HttpMethod.GET,
		});
	}

	async driverLocation(
		orderId: string,
		driverId: string
	): Promise<driverLocationResponse> {
		return this.request({
			url: `/v2/orders/${orderId}/drivers/${driverId}/location`,
			method: HttpMethod.GET,
		});
	}

	async cancelOrder(orderId: string): Promise<cancelOrderResponse> {
		return this.request({
			url: `/v2/orders/${orderId}/cancel`,
			method: HttpMethod.PUT,
		});
	}
}
