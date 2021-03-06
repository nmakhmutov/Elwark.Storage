import { Controller, Get, Param } from '@nestjs/common';
import { ValidationException } from '../../exeptions/validation.exception';
import { LanguageDTO } from './language.dto';
import { LanguageService } from './language.service';

@Controller('languages')
export class LanguageController {
    constructor(private readonly languageService: LanguageService) {}

    @Get()
    public async Get(): Promise<LanguageDTO[]> {
        const result = await this.languageService.getMain();

        return result.map((x) => new LanguageDTO(x));
    }

    @Get('full')
    public async GetFull(): Promise<LanguageDTO[]> {
        const result = await this.languageService.getAll();

        return result.map((x) => new LanguageDTO(x));
    }

    @Get('code/:code')
    public async GetByCode(@Param('code') code: string): Promise<LanguageDTO> {
        let result;

        switch (code.length) {
            case 2:
                result = await this.languageService.getByAlpha1Code(code);
                break;
            case 3:
                result = await this.languageService.getByAlpha3Code(code);
                break;
            default:
                throw new ValidationException(`Unknown language code format ${code}`);
        }

        return new LanguageDTO(result);
    }
}
