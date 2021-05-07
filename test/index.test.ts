import * as dotenv from 'dotenv';
dotenv.config();

import { Country, Lalamove, serviceType, specialRequest } from '../src';
import addMinutes from 'date-fns/fp/addMinutes';

const lalamove = new Lalamove({
  baseUrl: process.env.LALAMOVE_BASE_URL || '',
  apiKey: process.env.LALAMOVE_API_KEY || '',
  apiSecret: process.env.LALAMOVE_API_SECRET || '',
  country: Country.TW_TPE,
});

describe('Lalamove Integration Test', () => {
  it('should pass the assertions', async () => {
    const orderTime = addMinutes(15, new Date());

    console.log('Get Quote');
    const quotation = await lalamove.getQuote({
      serviceType: serviceType[lalamove.getCountry()].MOTORCYCLE,
      destinations: [
        {
          location: {
            lat: 25.0300623,
            lng: 121.5546788,
          },
          addresses: {
            zh_TW: {
              displayString: '台北市大安區臨江街106-5號',
            },
          },
        },
        {
          location: {
            lat: 25.051514,
            lng: 121.5214066,
          },
          addresses: {
            zh_TW: {
              displayString: '台灣台北市中山區中山北路一段18之二號',
            },
          },
        },
      ],
      deliveryInfo: [
        {
          stopIndex: 1,
          receiver: {
            name: 'Weserve Tester',
            phone: '0955940336',
          },
          remarks: {
            樓層: '1樓',
            備註: '',
            代收金額: '701',
          },
        },
      ],
      sender: {
        name: '天使雞排 - 通化店',
        phone: '0908309579',
      },
      scheduleAt: orderTime,
      specialRequest: [specialRequest[lalamove.getCountry()].HELP_BUY],
    });

    expect(quotation).toBeDefined();
    expect(quotation).toHaveProperty('totalFee');
    expect(quotation).toHaveProperty('totalFeeCurrency');

    console.log('Place Order');
    const order = await lalamove.placeOrder({
      serviceType: serviceType[lalamove.getCountry()].MOTORCYCLE,
      destinations: [
        {
          location: {
            lat: 25.0300623,
            lng: 121.5546788,
          },
          addresses: {
            zh_TW: {
              displayString: '台北市大安區臨江街106-5號',
            },
          },
        },
        {
          location: {
            lat: 25.051514,
            lng: 121.5214066,
          },
          addresses: {
            zh_TW: {
              displayString: '台灣台北市中山區中山北路一段18之二號',
            },
          },
        },
      ],
      deliveryInfo: [
        {
          stopIndex: 1,
          receiver: {
            name: 'Weserve Test Customer',
            phone: '0955940336',
          },
          remarks: {
            樓層: '1樓',
            備註: '',
            代收金額: '701',
          },
        },
      ],
      sender: {
        name: 'Weserve Test Store',
        phone: '0955940336',
      },
      scheduleAt: orderTime,
      specialRequest: [specialRequest[lalamove.getCountry()].HELP_BUY],
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

    console.log('Order Cancel');
    const orderCancel = await lalamove.cancelOrder(order.orderRef);
    expect(orderCancel).toBeDefined();
  });
});
