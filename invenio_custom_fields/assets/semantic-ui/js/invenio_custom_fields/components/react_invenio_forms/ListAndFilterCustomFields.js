import React, { useState, useMemo } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Item,
  Label,
  Modal,
  Segment,
} from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export const ListAndFilterCustomFields = ({ sections, onSelectSection }) => {
  const [filteredFieldsList, setFilteredFieldsList] = useState([]);

  const dropdownOptions = useMemo(
    () =>
      sections.map((section) => ({
        key: section.section,
        text: section.section,
        value: section,
      })),
    [sections]
  );

  const getFieldsConfig = (sectionCfg) => {
    return sectionCfg.fieldsConfig.reduce((result, current) => {
      const { field, props, ui_widget, ...otherCfg } = current;
      result[field] = {
        ui_widget: ui_widget,
        section: sectionCfg,
        ...props,
        ...otherCfg,
      };

      return result;
    }, {});
  };

  const handleSelectChange = (e, { value: selectedSection }) => {
    if (!selectedSection) {
      setFilteredFieldsList([]);
    }

    const filteredResults = getFieldsConfig(selectedSection);

    onSelectSection(selectedSection);
    setFilteredFieldsList(filteredResults);
  };

  return (
    <>
      <Segment as={Modal.Content} attached="bottom ml-0">
        <span className="flex align-items-center">
          <Dropdown
            className="ml-5"
            inline
            fluid
            clearable
            selection
            placeholder={i18next.t("Select domain")}
            options={dropdownOptions}
            onChange={handleSelectChange}
          />
        </span>
      </Segment>
      <Modal.Content scrolling>
        <Item.Group divided relaxed>
          {Object.entries(filteredFieldsList).map(([key, value]) => {
            const names = key.split(":");

            return (
              <Item
                key={key}
                className="pr-10 pl-10"
                fieldName={key}
                field={filteredFieldsList[key]}
              >
                <Item.Content>
                  <Item.Header className="mb-5">{value.label}</Item.Header>
                  <Item.Description>
                    <Grid>
                      <Grid.Column width={12}>{value.note}</Grid.Column>
                    </Grid>
                  </Item.Description>
                  <Item.Extra>
                    <Label>
                      <Icon name={value.section.icon} />
                      {value.section.section}: {names[0]}
                    </Label>
                    {value.multiple_values === true && (
                      <Label basic>
                        <Icon name="list ol" />{" "}
                        {i18next.t("Multiple value field")}
                      </Label>
                    )}
                    {value.type === "text" && (
                      <Label basic>
                        <Icon name="text cursor" /> {i18next.t("Text field")}
                      </Label>
                    )}
                  </Item.Extra>
                </Item.Content>
              </Item>
            );
          })}{" "}
        </Item.Group>
      </Modal.Content>
    </>
  );
};
