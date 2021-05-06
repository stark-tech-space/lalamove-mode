import * as dotenv from 'dotenv';
dotenv.config();

import { Country, ServiceTypeTW, Lalamove, SpecialRequestTW } from '../src';
import addMinutes from 'date-fns/fp/addMinutes';

const lalamove = new Lalamove({
	baseUrl: 'https://sandbox-rest.lalamove.com',
	apiKey: process.env.LALAMOVE_API_KEY || '',
	apiSecret: process.env.LALAMOVE_API_SECRET || '',
	country: Country.TW,
});

describe('Lalamove Integration Test', () => {
	it('should pass the assertions', async () => {
		const orderTime = addMinutes(15, new Date());

		console.log('Get Quote');
		const quotation = await lalamove.getQuote({
			serviceType: ServiceTypeTW.MOTORCYCLE,
			destinations: [
				{
					location: {
						lat: 25.033674479947212,
						lng: 121.54918243013232,
					},
					addresses: {
						zh_TW: {
							displayString: '台北市大安區敦化南路一段337號',
						},
					},
				},
				{
					location: {
						lat: 25.033674479947212,
						lng: 121.54918243013232,
					},
					addresses: {
						zh_TW: {
							displayString: '台北市大安區敦化南路一段337號',
						},
					},
				},
			],
			deliveryInfo: [
				{
					stopIndex: 1,
					receiver: {
						name: 'Test Receiver',
						phone: '0955940336',
					},
					remarks: {
						樓層: '8',
						備註: '到了打電話',
						代收金額: '2000',
					},
				},
			],
			sender: {
				name: 'Test Sender',
				phone: '0955940336',
			},
			scheduleAt: null,
			specialRequest: [SpecialRequestTW.HELP_BUY],
		});

		expect(quotation).toBeDefined();
		expect(quotation).toHaveProperty('totalFee');
		expect(quotation).toHaveProperty('totalFeeCurrency');

		console.log('Place Order');
		const order = await lalamove.placeOrder({
			serviceType: ServiceTypeTW.MOTORCYCLE,
			destinations: [
				{
					location: {
						lat: 25.033674479947212,
						lng: 121.54918243013232,
					},
					addresses: {
						zh_TW: {
							displayString: '台北市大安區敦化南路一段337號',
						},
					},
				},
				{
					location: {
						lat: 25.033674479947212,
						lng: 121.54918243013232,
					},
					addresses: {
						zh_TW: {
							displayString: '台北市大安區敦化南路一段337號',
						},
					},
				},
			],
			deliveryInfo: [
				{
					stopIndex: 1,
					receiver: {
						name: 'Test Receiver',
						phone: '0955940336',
					},
					remarks: {
						樓層: '8',
						備註: '到了打電話',
						代收金額: '2000',
					},
				},
			],
			sender: {
				name: 'Test Sender',
				phone: '0955940336',
			},
			scheduleAt: orderTime,
			specialRequest: [SpecialRequestTW.HELP_BUY],
			totalFee: {
				amount: quotation.totalFee,
				currency: quotation.totalFeeCurrency,
			},
			smsForReceiver: true,
		});

		expect(order).toBeDefined();
		expect(order).toHaveProperty('customerOrderId');
		expect(order).toHaveProperty('orderRef');

		console.log('Order Detail');
		const orderDetail = await lalamove.orderDetail(order.orderRef);

		expect(orderDetail).toBeDefined();
		expect(orderDetail).toHaveProperty('status');
		expect(orderDetail).toHaveProperty('price');
		expect(orderDetail.price).toBeDefined();
		expect(orderDetail.price).toHaveProperty('amount');
		expect(orderDetail.price).toHaveProperty('currency');
		expect(orderDetail).toHaveProperty('driverId');
	});
});
