import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}

export class TagPersonDto {
  @IsUUID('4')
  personId!: string;

  @IsString()
  @MaxLength(100)
  tagName!: string;
}
