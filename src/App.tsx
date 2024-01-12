import React, { FC, useEffect, useRef, useState } from "react";
import { InputRef, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { thesis } from "./thesis";
import Highlighter from "react-highlight-words";
import { Button, Input, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import {
  SearchOutlined,
  HolderOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { FilterConfirmProps } from "antd/es/table/interface";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const App: FC = () => {
  interface DataType {
    key: React.Key;
    id: string;
    supervisor: string;
    topic: string;
    action: string;
  }
  type DataIndex = keyof DataType;

  const uniqueNames = Array.from(
    new Set(thesis.map((item) => item.content.split(" - ")[0]))
  );

  const storedItems = JSON.parse(localStorage.getItem("items") ?? "[]");
  const [myList, setMyList] = useState<any>(storedItems);

  const [supervisorFilter, setSupervisorFilter] = useState<any | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataType> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: "10%",
      sorter: (a: any, b: any) => a.id - b.id,
      sortDirections: ["descend", "ascend"],
      render: (_, __, index) => index + 1,
    },
    {
      title: "Supervisor",
      dataIndex: "supervisor",
      key: "supervisor",
      sorter: (a, b) => a.supervisor.localeCompare(b.supervisor),
      filters: uniqueNames.map((name) => ({ text: name, value: name })),
      filterMode: "tree",
      width: "25%",
      filterSearch: true,
      filteredValue: supervisorFilter ? [...supervisorFilter] : null,
      onFilter: (value: any, record) => record.supervisor.indexOf(value) === 0,
      sortDirections: ["descend", "ascend"],
      // ...getColumnSearchProps("supervisor"),
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      sorter: (a, b) => a.topic.localeCompare(b.topic),
      sortDirections: ["descend", "ascend"],
      filteredValue: topicFilter ? [topicFilter] : null,
      ...getColumnSearchProps("topic"),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <a
          onClick={() => {
            // only add if it's not already in the list
            if (
              !myList.find(
                (item: any) =>
                  item.supervisor + item.topic ===
                  record.supervisor + record.topic
              )
            ) {
              setMyList([...myList, record]);
            }
          }}
        >
          Add to list
        </a>
      ),
    },
  ];

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(myList));
  }, [myList]);

  const data = thesis
    .filter(
      (item) =>
        !myList.find((i: any) => {
          const currentTopic = item.content.split(" - ");
          const supervisor = currentTopic[0];
          const topicName =
            currentTopic.length > 2
              ? currentTopic.slice(1).join(" - ")
              : currentTopic[1];
          return i.supervisor + i.topic === supervisor + topicName;
        })
    )
    .map((item, idx) => {
      const currentTopic = item.content.split(" - ");
      const supervisor = currentTopic[0];
      const topicName =
        currentTopic.length > 2
          ? currentTopic.slice(1).join(" - ")
          : currentTopic[1];
      return {
        key: idx,
        id: `topic-${idx + 1}`,
        supervisor: supervisor,
        topic: topicName,
        action: "Add to list",
      };
    });

  const onChange: TableProps<DataType>["onChange"] = (
    // @ts-ignore
    pagination,
    filters: any,
    // @ts-ignore
    sorter,
    // @ts-ignore
    extra
  ) => {
    console.log("filters.supervisor");
    console.log(filters.supervisor);
    setSupervisorFilter(filters.supervisor?.length ? filters.supervisor : null);
    setTopicFilter(filters.topic?.length ? filters.topic[0] : null);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="main-wrapper"
        style={{
          alignSelf: "center",
          paddingTop: "5rem",
          paddingBottom: "10rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            alignSelf: "center",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "start",
            gap: "2rem",
          }}
        >
          <Table
            style={{ width: "100%" }}
            columns={columns}
            dataSource={data}
            onChange={onChange}
            pagination={{
              pageSize: 10, // Set the desired number of items per page
              // pageSizeOptions: ["10", "20", "30"], // Optional: provide a dropdown for different page sizes
            }}
          />
          <h1>My List</h1>
          <div style={{ width: "100%" }}>
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                const items = Array.from(myList);
                const [reorderedItem] = items.splice(result.source.index, 1);
                items.splice(result.destination.index, 0, reorderedItem);
                setMyList(items);
              }}
            >
              <Droppable droppableId="topics">
                {(provided: any) => (
                  <ul
                    className="list-items"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {myList.map((item: any, index: any) => {
                      return (
                        <Draggable
                          key={item.supervisor + item.topic}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided: any) => (
                            <li
                              // initial={{ opacity: 0, y: 20 }}
                              // animate={{ opacity: 1, y: 0 }}
                              // transition={{ duration: 0.5, delay: index * 0.1 }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                userSelect: "none",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <p>{index + 1}</p>
                              <HolderOutlined />
                              <div>
                                <p>{item.supervisor}</p>
                                <p>{item.topic}</p>
                              </div>
                              <DeleteOutlined
                                onClick={() => {
                                  const newList = myList.filter(
                                    (i: any) => i.id !== item.id
                                  );
                                  setMyList(newList);
                                }}
                                style={{ color: "red" }}
                              />
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
