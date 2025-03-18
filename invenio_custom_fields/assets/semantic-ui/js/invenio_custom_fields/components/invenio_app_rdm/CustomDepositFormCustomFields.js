import React from "react";
import { CustomFields } from "../react_invenio_forms/CustomFields";

export const CustomDepositFormCustomFields = ({ record, customFieldsUI }) => {
  return (
    <CustomFields
      config={customFieldsUI}
      record={record}
      templateLoaders={[
        (widget) => import(`@templates/custom_fields/${widget}.js`),
        (widget) => import(`@js/invenio_rdm_records/src/deposit/customFields`),
        (widget) => import(`react-invenio-forms`),
      ]}
      fieldPathPrefix="custom_fields"
    />
  );
};
