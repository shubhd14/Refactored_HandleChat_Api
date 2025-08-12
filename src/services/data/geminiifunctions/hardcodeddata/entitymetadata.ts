export class LocalizedLabel {
  Label!: string;
  LanguageCode!: number;
  IsManaged!: boolean;
  MetadataId!: string;
  HasChanged!: any;
}
export class LabelContainer {
  LocalizedLabels!: LocalizedLabel[];
  UserLocalizedLabel!: LocalizedLabel;
}
export class EntityMetadata {
  MetadataId!: string;
  LogicalName!: string;
  SchemaName!: string;
  PrimaryIdAttribute!: string;
  PrimaryNameAttribute!: string;
  DisplayName!: LabelContainer;
  Description!: LabelContainer;
  static fromJson(json: any): EntityMetadata {
    const entity = new EntityMetadata();
    entity.MetadataId = json.MetadataId;
    entity.LogicalName = json.LogicalName;
    entity.SchemaName = json.SchemaName;
    entity.PrimaryIdAttribute = json.PrimaryIdAttribute;
    entity.PrimaryNameAttribute = json.PrimaryNameAttribute;
    entity.DisplayName = json.DisplayName;
    entity.Description = json.Description;
    return entity;
  }
  getDisplayName(): string {
    return this.DisplayName?.UserLocalizedLabel?.Label || '';
  }
  getDescription(): string {
    return this.Description?.UserLocalizedLabel?.Label || '';
  }
}
export class AttributeMetadata{
  MetadataId!: string;
  LogicalName!: string;
  DisplayName!: LabelContainer;
  Description!: LabelContainer;

  static fromJson(json: any): AttributeMetadata {
    const Attribute = new AttributeMetadata();
    Attribute.MetadataId = json.MetadataId;
    Attribute.LogicalName = json.LogicalName;
    Attribute.DisplayName = json.DisplayName;
    Attribute.Description = json.Description;
    return Attribute;
  }
  getDisplayName(): string {
    return this.DisplayName?.UserLocalizedLabel?.Label || '';
  }

  getDescription(): string {
    return this.Description?.UserLocalizedLabel?.Label || '';
  }
}
