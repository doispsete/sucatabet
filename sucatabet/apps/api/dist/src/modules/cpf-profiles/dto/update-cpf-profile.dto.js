"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCpfProfileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_cpf_profile_dto_1 = require("./create-cpf-profile.dto");
class UpdateCpfProfileDto extends (0, mapped_types_1.PartialType)(create_cpf_profile_dto_1.CreateCpfProfileDto) {
}
exports.UpdateCpfProfileDto = UpdateCpfProfileDto;
