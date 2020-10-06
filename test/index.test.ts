import { Country, ServiceTypeTW, Lalamove } from '../src';

const lalamove = new Lalamove({
	baseUrl: 'https://sandbox-rest.lalamove.com/v2',
	apiKey: '',
	apiSecret: '',
	country: Country.TW,
});

describe('Get Quotation', () => {
	it('should pass the assertions', async () => {
		const quotation = await lalamove.getQuote({
			serviceType: ServiceTypeTW.MOTORCYCLE,
			destinations: [{}],
		});
	});
});
