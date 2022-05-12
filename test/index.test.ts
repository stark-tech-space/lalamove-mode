import * as dotenv from 'dotenv';
dotenv.config();
// import util from "util";
import {
  Category,
  City,
  HandlingInstructions,
  Lalamove,
  LanguagesTW,
  Market,
  OrderDetailResponse,
  OrderPlacementResponse,
  QuoteResponse,
  Reason,
  SERVICE_TYPE_MAP,
  SpecialRequest,
  Weight,
} from '../src';
import addMinutes from 'date-fns/fp/addMinutes';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lalamove = new Lalamove({
  baseUrl: process.env.LALAMOVE_BASE_URL || '',
  apiKey: process.env.LALAMOVE_API_KEY || '',
  apiSecret: process.env.LALAMOVE_API_SECRET || '',
  market: Market.TAIWAN,
});
let quotation: QuoteResponse | null = null;
let order: OrderPlacementResponse | null = null;

// for see city info

// const result = await lalamove.getCityInfo();

// console.log(
//   util.inspect(result, { showHidden: false, depth: null, colors: true })
// );

describe('Lalamove Integration Test', () => {
  it('Get Quote', async () => {
    const orderTime = addMinutes(15, new Date());

    quotation = await lalamove.getQuote({
      city: City.TW_TPE,
      serviceType: SERVICE_TYPE_MAP.TW.VAN,
      specialRequests: [
        // legal
        SpecialRequest.PETS,
        // illegal
        SpecialRequest.ChildMultiSelect10,
      ],
      language: LanguagesTW.zh_TW,
      stops: [
        {
          coordinates: {
            lat: 25.01972950042076,
            lng: 121.52980498651789,
          },
          address: '台北市大安區羅斯福路三段233號',
        },
        {
          coordinates: {
            lat: 25.023258559494685,
            lng: 121.52866772996325,
          },
          address: '台北市大安區師大路93巷1號',
        },
      ],
      item: {
        quantity: '3',
        weight: Weight.LESS_THAN_3KG,
        categories: [Category.FOOD_DELIVERY],
        handlingInstructions: [HandlingInstructions.KEEP_UPRIGHT],
      },
      isRouteOptimized: true,
    });

    // console.log(quotation!.specialRequest);

    expect(quotation).toHaveProperty('quotationId');
    expect(quotation).toHaveProperty('scheduleAt');
    expect(quotation).toHaveProperty('expiresAt');
    expect(quotation).toHaveProperty('serviceType');
    expect(quotation).toHaveProperty('specialRequests');
    expect(quotation).toHaveProperty('language');
    expect(quotation).toHaveProperty('stops');
    expect(quotation).toHaveProperty('isRouteOptimized');
    expect(quotation).toHaveProperty('priceBreakdown');
    expect(quotation).toHaveProperty('item');
    // expect(quotation).toHaveProperty("cashOnDelivery");
  });

  it('Place Order', async () => {
    order = await lalamove.placeOrder({
      quotationId: quotation!.quotationId,
      sender: {
        stopId: quotation!.stops[1].stopId || '',
        name: 'Weserve Test Store',
        phone: '+886912345678',
      },
      recipients: [
        {
          stopId: quotation!.stops[0].stopId || '',
          name: 'Weserve Test Customer',
          phone: '+886912345123',
        },
      ],
      isRecipientSMSEnabled: false,
      isPODEnabled: false,
      metadata: { storeName: 'test weserve' },
    });

    expect(order).toBeDefined();
    //expect(order).toHaveProperty('customerOrderId'); //deprecated in sandbox environment.
    expect(order).toHaveProperty('orderId');
    expect(order).toHaveProperty('quotationId');
    expect(order).toHaveProperty('priceBreakdown');
    // expect(order).toHaveProperty("priorityFee");
    expect(order).toHaveProperty('shareLink');
    expect(order).toHaveProperty('status');
    expect(order).toHaveProperty('distance');
    expect(order).toHaveProperty('stops');
    expect(order).toHaveProperty('metadata');
    // expect(order).toHaveProperty("cashOnDelivery");
  });

  it('Add tips', async () => {
    const addTips = await lalamove.addPriorityFee(order!.orderId, 30);

    expect(addTips).toBeDefined();
    expect(addTips).toHaveProperty('orderId');
    expect(addTips).toHaveProperty('quotationId');
    expect(addTips).toHaveProperty('priceBreakdown');
    expect(addTips).toHaveProperty('priceBreakdown.priorityFee');
    expect(addTips).toHaveProperty('status');
    expect(addTips).toHaveProperty('distance');
  });
});

console.log(
  '在運行下列測試之前，請先到https://partnerportal.lalamove.com/records 接單，不過取消司機需要接單超過15分鐘才可取消。',
);

// 在運行下列測試之前，請先到https://partnerportal.lalamove.com/records 接單，不過取消司機需要接單超過15分鐘才可取消。

describe('try to change driver and cancel order', () => {
  let orderDetail: OrderDetailResponse | null = null;
  it('order detail', async () => {
    // await delay(15000);
    orderDetail = await lalamove.orderDetail(order!.orderId);

    expect(orderDetail).toBeDefined();
    expect(orderDetail).toHaveProperty('orderId');
    expect(orderDetail).toHaveProperty('quotationId');
    expect(orderDetail).toHaveProperty('priceBreakdown');
    expect(orderDetail).toHaveProperty('priceBreakdown.priorityFee');
    // expect(orderDetail).toHaveProperty("priorityFee");
    expect(orderDetail).toHaveProperty('driverId');
    expect(orderDetail).toHaveProperty('shareLink');
    expect(orderDetail).toHaveProperty('status');
    expect(orderDetail).toHaveProperty('distance');
    expect(orderDetail).toHaveProperty('stops');
    expect(orderDetail).toHaveProperty('metadata');
    // expect(orderDetail).toHaveProperty("cashOnDelivery");
  });

  // change driver需要先手動接單，才能拿到driverId,或是可以手動放上已經有接單且過15分鐘的訂單跟driverId來測試，記得把assert改成正確的東西。

  it.skip('change driver fail', async () => {
    const driverCancel = await lalamove
      .changeDriver({
        orderId: order!.orderId,
        driverId: orderDetail!.driverId,
        reason: Reason.DRIVER_ASKED_CHANGE,
      })
      .catch((err) => {
        const status = JSON.parse(err.message).error.status;
        expect(status).toBe(422);
      });
  });

  it('cancel order', async () => {
    const orderCancel = await lalamove.cancelOrder(order!.orderId);
    expect(orderCancel).toBeDefined();
  });
});
