import React, { Component } from 'react';
import Table from '../../../../components/Table';
import constants from '../../../../utils/constants';
import './styles.scss';
import CodeViewModal from '../../../../components/Modal/CodeViewModal/CodeViewModal';
import ConfirmModal from '../../../../components/Modal/ConfirmModal';
import api, { remove, get } from '../../../../utils/api';
import endpoints, { uriDeleteSchemaVersion, uriSchemaVersions } from '../../../../utils/endpoints';

class SchemaVersions extends Component {
  state = {
    data: [],
    selectedCluster: this.props.clusterId,
    selectedSchema: this.props.schemaName,
    showSchemaModal: false,
    schemaVersions: this.props.schemas,
    schemaModalBody: '',
    deleteMessage: '',
    schemaToDelete: {},
    deleteData: { clusterId: '', subject: '', versionId: 1 }
  };

  componentDidMount() {
    this.handleData(this.state.schemaVersions);
  }

  handleData(schemas) {
    if (schemas) {
      let data = schemas.map(schema => {
        return {
          id: schema.id,
          version: schema.version,
          schema: JSON.stringify(JSON.parse(schema.schema), null, 2)
        };
      });
      this.setState({ data });
    } else {
      this.setState({ data: [] });
    }
  }

  showSchemaModal = body => {
    this.setState({
      showSchemaModal: true,
      schemaModalBody: body
    });
  };

  closeSchemaModal = () => {
    this.setState({ showSchemaModal: false, schemaModalBody: '' });
  };

  handleOnDelete(schema) {
    this.setState({ schemaToDelete: schema }, () => {
      this.showDeleteModal(`Delete Version ${schema.id}?`);
    });
  }

  showDeleteModal = deleteMessage => {
    this.setState({ showDeleteModal: true, deleteMessage });
  };

  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false, deleteMessage: '' });
  };

  deleteSchemaRegistry = () => {
    const { selectedCluster, schemaToDelete, selectedSchema } = this.state;
    const { history } = this.props;
    const deleteData = {
      clusterId: selectedCluster,
      subject: selectedSchema,
      versionId: schemaToDelete.version
    };
    history.push({ loading: true });
    remove(uriDeleteSchemaVersion(), deleteData)
      .then(res => {
        this.props.history.push({
          showSuccessToast: true,
          successToastMessage: `Version'${schemaToDelete.version}' is deleted`,
          loading: false
        });
        this.setState({ showDeleteModal: false, schemaToDelete: {} }, () => {
          this.handleData(res.data);
        });
      })
      .catch(err => {
        this.props.history.push({
          showErrorToast: true,
          errorToastMessage: `Could not delete '${schemaToDelete.subject}'`,
          loading: false
        });
        this.setState({ showDeleteModal: false, schemaToDelete: {} });
      });
  };

  render() {
    const { data, selectedCluster, showSchemaModal, schemaModalBody } = this.state;
    return (
      <div>
        <Table
          columns={[
            {
              id: 'id',
              accessor: 'id',
              colName: 'Id',
              type: 'text'
            },
            {
              id: 'version',
              accessor: 'version',
              colName: 'Version',
              type: 'text',
              cell: (obj, col) => {
                return <span className="badge badge-primary">{obj[col.accessor] || ''}</span>;
              }
            },
            {
              id: 'schema',
              accessor: 'schema',
              colName: 'Schema',
              type: 'text',
              cell: (obj, col) => {
                return (
                  <div className="value cell-div">
                    <span className="align-cell value-span">
                      {obj[col.accessor] ? obj[col.accessor].substring(0, 150) : 'N/A'}
                      {obj[col.accessor] && obj[col.accessor].length > 100 && '(...)'}{' '}
                    </span>
                    <div className="value-button">
                      <button
                        className="btn btn-secondary headers pull-right"
                        onClick={() => this.showSchemaModal(obj[col.accessor])}
                      >
                        ...
                      </button>
                    </div>
                  </div>
                );
              }
            }
          ]}
          data={this.state.data}
          onDelete={schema => {
            this.handleOnDelete(schema);
          }}
          actions={[constants.TABLE_DELETE]}
        />
        <ConfirmModal
          show={this.state.showDeleteModal}
          handleCancel={this.closeDeleteModal}
          handleConfirm={this.deleteSchemaRegistry}
          message={this.state.deleteMessage}
        />

        <CodeViewModal
          show={showSchemaModal}
          body={schemaModalBody}
          handleClose={this.closeSchemaModal}
        />
      </div>
    );
  }
}
export default SchemaVersions;