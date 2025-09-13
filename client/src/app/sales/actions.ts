import {restCrud} from "@/lib/rest-crud.ts";
import {salesClient} from "@/lib/http.ts";
import {Sale, SaleDto} from "@/app/sales/definitions.ts";
import {parseAbsoluteToLocal} from "@internationalized/date";

function entityConverter(dto: any): Sale {
  return {
    ...dto,
    date: parseAbsoluteToLocal(dto.date)
  };
}

const crud = restCrud<Sale, SaleDto>(salesClient, '/sales', {
  entityConverter,
});

export const salesService = {
  ...crud,
}