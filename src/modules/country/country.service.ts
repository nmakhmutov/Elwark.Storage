import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ValidationException } from '../../exeptions/validation.exception';
import { nameof } from '../../utils';
import { COUNTRY_MODEL } from './country.constants';
import { Country, CountryTranslation } from './country.interface';

@Injectable()
export class CountryService {
    constructor(@Inject(COUNTRY_MODEL) private readonly countryModel: Model<Country>) { }

    public async getAll(): Promise<Country[]> {
        const result = await this.countryModel.find();

        return result;
    }

    public async getByCodes(codes: string[]): Promise<Country[]> {
        const query = [];

        const alpha2 = codes.filter(x => x.length === 2 && isNaN(Number.parseInt(x)));
        if (alpha2.length > 0)
            query.push({ [nameof<Country>('alpha2Code')]: { $in: alpha2 } });

        const alpha3 = codes.filter(x => x.length === 3 && isNaN(Number.parseInt(x)));
        if (alpha3.length > 0)
            query.push({ [nameof<Country>('alpha3Code')]: { $in: alpha3 } });

        const numeric = codes.filter(x => !isNaN(Number.parseInt(x)));
        if (numeric.length > 0)
            query.push({ [nameof<Country>('numericCode')]: { $in: numeric } });

        const result = await this.countryModel.find({ $or: query });

        if (result.length !== 0)
            return result;

        throw new NotFoundException(`Country with codes (${codes.join(', ')}) not found`);
    }

    public async getByAlpha2Code(code: string): Promise<Country> {
        if (code.length !== 2) throw new ValidationException('Alpha 2 code for country must be with 2 symbols');

        const result = await this.countryModel.findOne({
            [nameof<Country>('alpha2Code')]: code,
        });

        if (result) return result;

        throw new NotFoundException(`Country with alpha 2 code ${code} not found.`);
    }

    public async getByAlpha3Code(code: string): Promise<Country> {
        if (code.length !== 3) throw new ValidationException('Alpha 3 code for country must be with 3 symbols');

        const result = await this.countryModel.findOne({
            [nameof<Country>('alpha3Code')]: code,
        });

        if (result) return result;

        throw new NotFoundException(`Country with alpha 3 code ${code} not found.`);
    }

    public async getByNumericCode(code: number): Promise<Country> {
        const result = await this.countryModel.findOne({
            [nameof<Country>('numericCode')]: code,
        });

        if (result) return result;

        throw new NotFoundException(`Country with numeric code ${code} not found.`);
    }

    public async getByCapital(capital: string): Promise<Country> {
        const result = await this.countryModel.findOne({
            [nameof<Country>('capital')]: {
                $regex: new RegExp('^' + capital + '$', 'i'), // case insensitive
            },
        });

        if (result) return result;

        throw new NotFoundException(`Country with capital ${capital} not found.`);
    }

    public async getByCommonName(name: string): Promise<Country> {
        const result = await this.countryModel.findOne({
            [nameof<Country>('name') + '.' + nameof<CountryTranslation>('common')]: {
                $regex: new RegExp('^' + name + '$', 'i'), // case insensitive
            },
        });

        if (result) return result;

        throw new NotFoundException(`Country with common name ${name} not found.`);
    }

    public async getByRegion(region: string): Promise<Country[]> {
        const result = await this.countryModel.find({
            [nameof<Country>('region')]: {
                $regex: new RegExp('^' + region + '$', 'i'), // case insensitive
            },
        });

        if (result.length > 0) return result;

        throw new NotFoundException(`Countries with region ${region} not found.`);
    }

    public async getByCurrency(currency: string): Promise<Country[]> {
        const result = await this.countryModel.find({
            [nameof<Country>('currencies')]: {
                $elemMatch: {
                    $regex: new RegExp('^' + currency + '$', 'i'), // case insensitive
                },
            },
        });

        if (result.length > 0) return result;

        throw new NotFoundException(`Countries which using currency ${currency} not found.`);
    }
}
