import axios, { AxiosInstance } from 'axios';
import getUnixTime from 'date-fns/fp/getUnixTime';
import formatISO from 'date-fns/fp/formatISO';
import * as crypto from 'crypto';
import { uuid as uuidv4 } from 'uuidv4';

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

export type lalamove = {
	baseUrl: string;
	apiKey: string;
	apiSecret: string;
	country: Country;
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

export type Address = {
	displayName: string;
};

export type WayPoint = {
	location: {
		lat: number;
		lng: number;
	};
	addresses: { [languageCode in Languages[Country]]: Address };
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
		amount: number;
		currency: string;
	};
	smsForReceiver: boolean;
}

export const language: { [country in Country]: Languages[Country][] } = {
	TW: [LanguagesTW.zh_TW],
};

export class Lalamove {
	private apiInfo: ApiInfo; // all property related to lalamove API
	private requestInstance: AxiosInstance; // axios instance
	private hashingAlgorithm = 'sha256';
	private static DEFAULT_TIMEOUT = 3000;

	// Lalamove class constructor
	constructor({ baseUrl, apiKey, apiSecret, country }: lalamove) {
		this.apiInfo = {
			country,
			apiKey,
			apiSecret,
		};
		this.requestInstance = axios.create({
			baseURL: baseUrl,
			timeout: Lalamove.DEFAULT_TIMEOUT,
		});
	}

	// create signature for lalamove access token
	private createSignature(rawForSignature: string, apiSecret: string) {
		const hashing = crypto.createHmac(this.hashingAlgorithm, apiSecret);
		hashing.update(rawForSignature);
		return hashing.digest('hex');
	}

	// do request with lalamove api
	async request({ url, method, body }: requestInfo): Promise<object> {
		const { country, apiKey, apiSecret } = this.apiInfo;
		const nowTimestamp = getUnixTime(new Date());

		// get signature from api config and request information
		const rawForSignature = `${nowTimestamp}\r\n${method}\r\n${url}\r\n\r\n${
			body ? '' : JSON.stringify(body)
		}`;
		const signature = this.createSignature(rawForSignature, apiSecret);
		const token = `${apiKey}:${nowTimestamp}:${signature}`;

		// use request mapping callback function object to replace if...else... statement
		const headers = {
			headers: {
				Authorization: `hmac ${token}`,
				'X-LLM-Country': country,
				'X-Request-ID': uuidv4(),
			},
		};
		const requestMapping: { [key in HttpMethod]: Function } = {
			GET: () => this.requestInstance.get(url, headers),
			POST: () => this.requestInstance.post(url, body, headers),
			PUT: () => this.requestInstance.put(url, body, headers),
		};

		// call lalamove and handle errors while response has error(s)
		try {
			const response = await requestMapping[method]();
			return response.data;
		} catch (error) {
			let status: number, data: object;
			if (error.response) {
				// out of range of 2xx response
				status = error.response.status;
				data = error.response.data;
			} else if (error.request) {
				// connection timeout
				status = 408;
				data = {
					message: 'Connection Timeout',
				};
			} else {
				// other unexpected error => need to print out error
				console.error(error);
				status = -1;
				data = {
					message: 'Unexpected Request Error',
				};
			}

			return {
				status,
				data,
			};
		}
	}

	async getQuote({
		serviceType,
		destinations,
		deliveryInfo,
		sender,
		scheduleAt,
		specialRequest,
	}: quoteRequest) {
		// create request body
		const requestBody = {
			serviceType,
			stops: destinations,
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
			scheduleAt: formatISO(scheduleAt),
			specialRequest,
		};

		return this.request({
			url: '/quotations',
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
	}: orderPlacementRequest) {
		// create request body
		const requestBody = {
			serviceType,
			stops: destinations,
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
			scheduleAt: formatISO(scheduleAt),
			specialRequest,
			quotedTotalFee: totalFee,
			sms: smsForReceiver,
		};

		return this.request({
			url: '/orders',
			method: HttpMethod.POST,
			body: requestBody,
		});
	}

	async orderDetail(orderId: string) {
		return this.request({
			url: `/orders/${orderId}`,
			method: HttpMethod.GET,
		});
	}

	async driverDetail(orderId: string, driverId: string) {
		return this.request({
			url: `/orders/${orderId}/drivers/${driverId}`,
			method: HttpMethod.GET,
		});
	}

	async driverLocation(orderId: string, driverId: string) {
		return this.request({
			url: `/orders/${orderId}/drivers/${driverId}/location`,
			method: HttpMethod.GET,
		});
	}

	async cancelOrder(orderId: string) {
		return this.request({
			url: `/orders/${orderId}/cancel`,
			method: HttpMethod.PUT,
		});
	}
}
