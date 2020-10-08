import axios, { AxiosInstance } from 'axios';
import getTime from 'date-fns/fp/getTime';
import formatISO from 'date-fns/fp/formatISO';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

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
	displayString: string;
	country?: Country;
};

export type WayPoint = {
	location: {
		lat: number;
		lng: number;
	};
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

export class LalamoveException extends Error {
	constructor(status: number, message: string) {
		super(`http status: ${status}, message: ${message}`);
	}
}

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
	private async request({ url, method, body }: requestInfo): Promise<any> {
		const { country, apiKey, apiSecret } = this.apiInfo;
		const nowTimestamp = getTime(new Date());

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

		console.log(headers);
		console.log(JSON.stringify(body, null, 2))
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
			let status: number, data: { message: string };
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

			console.log('status', status);
			console.log('data', data);
			throw new LalamoveException(status, data.message);
		}
	}

	getCountry() {
		return this.apiInfo.country;
	}

	setCountry(country: Country) {
		this.apiInfo.country = country;
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
			stops: destinations.map(({ location, addresses }) => {
				if (!addresses.zh_TW) {
					throw new LalamoveException(400, 'addresses for zh_TW does not exist');
				}
				
				addresses.zh_TW.country = this.apiInfo.country;
				return {
					location,
					addresses,
				};
			}),
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
