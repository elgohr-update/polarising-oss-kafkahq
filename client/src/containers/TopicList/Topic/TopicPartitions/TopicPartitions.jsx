import React, { Component } from 'react';
import { uriTopicsPartitions } from '../../../../utils/endpoints';
import Table from '../../../../components/Table';
import { get } from '../../../../utils/api';
import converters from '../../../../utils/converters';

class TopicPartitions extends Component {
  state = {
    data: [],
    selectedCluster: this.props.clusterId,
    selectedTopic: this.props.topic
  };
  componentDidMount() {
    this.getTopicsPartitions();
  }

  async getTopicsPartitions() {
    let partitions = [];
    const { selectedCluster, selectedTopic } = this.state;
    const { history } = this.props;
    history.push({
      loading: true
    });
    try {
      partitions = await get(uriTopicsPartitions(selectedCluster, selectedTopic));
      this.handleData(partitions.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      history.push({
        loading: false
      });
    }
  }

  handleData(partitions) {
    let tablePartitions = partitions.map(partition => {
      return {
        id: partition.id,
        leader: partition.leader.id,
        replicas: partition.nodes,
        offsets: (
          <label>
            {partition.firstOffset} ⤑ {partition.lastOffset}
          </label>
        ),
        size: partition
      };
    });
    this.setState({ data: tablePartitions });
  }

  handleLeader(leader) {
    return <span className="badge badge-primary"> {leader}</span>;
  }

  handleReplicas(replicas) {
    return replicas.map(replica => {
      return (
        <span
          key={replica.id}
          className={replica.inSyncReplicas ? 'badge badge-success' : 'badge badge-danger'}
        >
          {' '}
          {replica.id}
        </span>
      );
    });
  }

  handleSize(size) {
    return (
      <label>
        {size.lastOffset-size.firstOffset} - {converters.showBytes(size.logDirSize, 0)}
      </label>
    );
  }

  render() {
    const { data } = this.state;
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
              id: 'leader',
              accessor: 'leader',
              colName: 'Leader',
              type: 'text',
              cell: (obj, col) => {
                return this.handleLeader(obj[col.accessor]);
              }
            },
            {
              id: 'replicas',
              accessor: 'replicas',
              colName: 'Replicas',
              type: 'text',
              cell: (obj, col) => {
                return this.handleReplicas(obj[col.accessor]);
              }
            },
            {
              id: 'offsets',
              accessor: 'offsets',
              colName: 'Offsets',
              type: 'text'
            },
            {
              id: 'size',
              accessor: 'size',
              colName: 'Size',
              type: 'text',
              cell: (obj, col) => {
                return this.handleSize(obj[col.accessor]);
              }
            }
          ]}
          data={data}
        />
      </div>
    );
  }
}

export default TopicPartitions;
