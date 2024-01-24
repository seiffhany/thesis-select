import React, { FC, useEffect, useRef, useState } from "react";
import { InputRef, Table, notification } from "antd";
import styles from "./App.module.css";
import type { ColumnsType, TableProps } from "antd/es/table";
import { thesis } from "./thesis";
import Highlighter from "react-highlight-words";
import { Button, Input, Space } from "antd";
import type { ColumnType } from "antd/es/table";
import { GithubOutlined } from "@ant-design/icons";
import {
  SearchOutlined,
  HolderOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { FilterConfirmProps } from "antd/es/table/interface";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Analytics } from "@vercel/analytics/react";
import { useResponsive } from "./hooks/useResponsive";

const App: FC = () => {
  interface DataType {
    key: React.Key;
    id: string;
    supervisor: string;
    topic: string;
    action: string;
  }
  type DataIndex = keyof DataType;

  const { isMobile } = useResponsive();

  const storedItems = JSON.parse(localStorage.getItem("items") ?? "[]");
  const [myList, setMyList] = useState<any>(storedItems);
  const [supervisorType, setSupervisorType] = useState<
    "All" | "GUC" | "Ain Shams"
  >("All");

  const [supervisorFilter, setSupervisorFilter] = useState<any | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const getFilteredItems = () => {
    const filtered = thesis.filter(
      (item) =>
        !myList.find((i: any) => {
          const currentTopic = item.content.split(" - ");
          const supervisor = currentTopic[0];
          const topicName =
            currentTopic.length > 2
              ? currentTopic.slice(1).join(" - ")
              : currentTopic[1];
          return i.topic + i.supervisor === topicName + supervisor;
        })
    );
    return filtered;
  };

  const filteredItems = getFilteredItems();

  const outsideSupervisors = [
    "Wagdy Anis Aziz",
    "Wael Zakaria Abdallah",
    "Sherif Saad Mohamed  Ahmed",
    "Mahmoud Ibrahim Khalil",
    "Hossam Eldin Hassan Abdelmunim",
    "Gamal Abdel Shafy",
  ];

  const getAllData = () => {
    return getFilteredItems().map((item, idx) => {
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
  };

  const [currData, setCurrData] = useState(getAllData());

  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setCurrData((_) => {
      const all = getFilteredItems().map((item, idx) => {
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

      if (supervisorType === "All") {
        return all;
      } else if (supervisorType === "GUC") {
        return all.filter(
          (item) => !outsideSupervisors.includes(item.supervisor)
        );
      } else {
        return all.filter((item) =>
          outsideSupervisors.includes(item.supervisor)
        );
      }
    });
  }, [myList, supervisorType]);

  const countSupervisor = (supervisor: string) => {
    const count = filteredItems.filter((item) =>
      item.content.includes(supervisor)
    ).length;
    return count;
  };

  const uniqueNames = Array.from(
    new Set(
      // filteredItems.map((item) => {
      //   const supervisor = item.content.split(" - ")[0];
      //   return `(${countSupervisor(supervisor)}) ` + supervisor;
      // })
      currData.map((item) => {
        const supervisor = item.supervisor;
        return `(${countSupervisor(supervisor)}) ` + supervisor;
      })
    )
  ).sort((a, b) => {
    const countA = Number(a.split(") ")[0].replace("(", ""));
    const countB = Number(b.split(") ")[0].replace("(", ""));
    if (countA > countB) return -1;
    if (countA < countB) return 1;
    return 0;
  });

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

  const getDescriptionLink = (supervisor: string) => {
    const data = [
      {
        supervisor: "Ahmed Mohammed Hassan Abdelfattah",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_03_38.pdf",
      },
      {
        supervisor: "Catherine Malak Noshy Ibrahim Elias",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_04_08.pdf",
      },
      {
        supervisor: "Ahmed Abd El-Hamid Mohamed Shafik Maarouf",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_06_28.pdf",
      },
      {
        supervisor: "Haitham Abdelsalam Ahmed Omran",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_07_16.pdf",
      },
      {
        supervisor: "Amr Abdallah Abou Shousha",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_07_42.pdf",
      },
      {
        supervisor: "Anke . Klingner",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_08_18.pdf",
      },
      {
        supervisor: "Haytham Osman Ismail",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_08_45.pdf",
      },
      {
        supervisor: "Hisham Hassaballah Othman",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_09_36.pdf",
      },
      {
        supervisor: "Mervat Mustafa Fahmy Abuelkheir",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_10_06.pdf",
      },
      {
        supervisor: "Milad Michel Ghantous",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_10_26.pdf",
      },
      {
        supervisor: "Mohamed Hamed Fahmy",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_10_46.pdf",
      },
      {
        supervisor: "Mohammed Abdel Megeed Salem",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_11_03.pdf",
      },
      {
        supervisor: "Mohamed Kamel Gabr",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_11_21.pdf",
      },
      {
        supervisor: "Nourhan Ehab Azab",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_11_42.pdf",
      },
      {
        supervisor: "Rimon . Elias",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_12_00.pdf",
      },
      {
        supervisor: "Shereen Moataz Mahmoud Mohamed Afifi",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_12_22.pdf",
      },
      {
        supervisor: "Wael  Mohamed AbulSadat",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_12_40.pdf",
      },
      {
        supervisor: "Maggie Ahmed Ezzat Mashaly",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_13_02.pdf",
      },
      {
        supervisor: "Mohamed Abdel Ghany Ahmed Salem",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_13_21.pdf",
      },
      {
        supervisor: "Wassim Joseph  Alexan",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_13_43.pdf",
      },
      {
        supervisor: "Hossam Eldin Hassan Abdelmunim",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_14_02.pdf",
      },
      {
        supervisor: "Wael Zakaria Abdallah",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T16_14_38.pdf",
      },
      {
        supervisor: "Eman Ahmed Hamdy Azab",
        link: "https://cms.guc.edu.eg/Uploads/61/-104/40002/GUC_-104_61_40002_2024-01-16T17_42_02.pdf",
      },
    ];
    const item = data.find((item) => item.supervisor === supervisor);
    return item?.link;
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: "5%",
      sorter: (a: any, b: any) =>
        Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]),
      sortDirections: ["descend", "ascend"],
      render: (_, record) => record.id.split("-")[1],
    },
    {
      title: "Supervisor",
      dataIndex: "supervisor",
      key: "supervisor",
      filters: uniqueNames.map((name) => ({ text: name, value: name })),
      // filterMode: "tree",
      sorter: (a, b) => a.supervisor.localeCompare(b.supervisor),
      width: "25%",
      filterSearch: true,
      filteredValue: supervisorFilter ? [...supervisorFilter] : null,
      onFilter: (value: any, record) =>
        record.supervisor.indexOf(value.split(") ")[1]) === 0,
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
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "8%",
      render: (_, record) => (
        <a
          onClick={() => {
            // only add if it's not already in the list
            if (
              !myList.find(
                (item: any) =>
                  item.topic + item.supervisor ===
                  record.topic + record.supervisor
              )
            ) {
              setMyList([...myList, record]);
            }
          }}
        >
          Add To List
        </a>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "12%",
      render: (_, record) => {
        const item = getDescriptionLink(record.supervisor);
        return item ? (
          <a href={`${item}`} target="_blank">
            View Description
          </a>
        ) : (
          <p style={{ color: "red", opacity: "0.5" }}>No Description</p>
        );
      },
    },
  ];

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    console.log("isMobile");
    console.log(isMobile);
    if (isMobile) {
      notification.info({
        message: "Please note this app is better opened on desktop",
        placement: "topLeft",
        duration: 0,
      });
    }
    return () => {
      notification.destroy();
    };
  }, [isMobile]);

  const onChange: TableProps<DataType>["onChange"] = (
    // @ts-ignore
    pagination,
    filters: any,
    // @ts-ignore
    sorter,
    // @ts-ignore
    extra
  ) => {
    setSupervisorFilter(filters.supervisor?.length ? filters.supervisor : null);
    setTopicFilter(filters.topic?.length ? filters.topic[0] : null);
  };

  return (
    <>
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
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <a
                href="https://github.com/seiffhany"
                target="_blank"
                style={{
                  textDecoration: "none",
                  color: "black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  opacity: 0.3,
                  cursor: "pointer",
                }}
              >
                <GithubOutlined style={{ fontSize: "1.5rem" }} />
                <p style={{ margin: 0 }}>Made by Seif Hany</p>
              </a>
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                {/* <p
                  style={{
                    position: "absolute",
                    left: "-6.5rem",
                    opacity: "0.3",
                  }}
                >
                  Supervisors:
                </p> */}
                <div
                  className={`${styles.filterButton} ${
                    supervisorType === "All" && styles.selectedFilter
                  }`}
                  onClick={() => {
                    setSupervisorType("All");
                  }}
                >
                  All
                </div>
                <div
                  className={`${styles.filterButton} ${
                    supervisorType === "GUC" && styles.selectedFilter
                  }`}
                  onClick={() => {
                    setSupervisorType("GUC");
                  }}
                >
                  GUC
                </div>
                <div
                  className={`${styles.filterButton} ${
                    supervisorType === "Ain Shams" && styles.selectedFilter
                  }`}
                  onClick={() => {
                    setSupervisorType("Ain Shams");
                  }}
                >
                  Ain Shams
                </div>
              </div>
            </div>
            <Table
              style={{ width: "100%" }}
              columns={columns}
              dataSource={currData}
              onChange={onChange}
              pagination={{
                pageSize: 10, // Set the desired number of items per page
                // pageSizeOptions: ["10", "20", "30"], // Optional: provide a dropdown for different page sizes
              }}
            />
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "2rem",
                marginTop: "2.5rem",
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  height: "1px",
                  backgroundColor: "black",
                }}
              />
              <h1
                style={{
                  textAlign: "center",
                  lineHeight: 1,
                  margin: 0,
                  // fontSize: "3rem",
                }}
              >
                My Thesis List
              </h1>
              <div
                style={{
                  flexGrow: 1,
                  height: "1px",
                  backgroundColor: "black",
                }}
              />
            </div>
            <div
              style={{
                width: "100%",
                ...(!isMobile && { paddingInline: "9rem" }),
              }}
            >
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
                        const link = getDescriptionLink(item.supervisor);
                        const isGUCian = !outsideSupervisors.includes(
                          item.supervisor
                        );
                        return (
                          <Draggable
                            key={item.supervisor + item.topic}
                            draggableId={item.supervisor + item.topic}
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
                                  position: "relative",

                                  ...provided.draggableProps.style,
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: isMobile ? "0.6rem" : "0.75rem",
                                    backgroundColor: isGUCian
                                      ? "#F28500"
                                      : "#5DBB63",
                                    paddingInline: "0.75rem",
                                    paddingBlock: "0.25rem",
                                    borderRadius: "0.5rem",
                                    textAlign: "center",
                                    width: isMobile ? "5rem" : "6rem",
                                    position: "absolute",
                                    bottom: "0.5rem",
                                    color: "white",
                                    textTransform: "uppercase",
                                    right: "0",
                                    opacity: 0.7,
                                  }}
                                >
                                  {isGUCian ? "GUC" : "Ain Shams"}
                                </p>
                                <p
                                  style={{
                                    position: "absolute",
                                    fontSize: isMobile ? "1.5rem" : "3.5rem",
                                    lineHeight: 1,
                                    top: isMobile ? "0rem" : "1rem",
                                    left: isMobile ? "1rem" : "-1rem",
                                    fontWeight: "bold",
                                    fontStyle: "italic",
                                    transform: "translateX(-100%)",
                                    opacity: 0.2,
                                  }}
                                >
                                  {index + 1}
                                </p>
                                <HolderOutlined />
                                <div className={`${styles.listItem}`}>
                                  <div>
                                    <p
                                      style={{
                                        fontSize: isMobile ? "1rem" : "1.25rem",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {item.topic}
                                    </p>
                                    <div
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <p
                                        style={{
                                          opacity: 0.5,
                                          ...(isMobile && {
                                            fontSize: "0.75rem",
                                          }),
                                        }}
                                      >
                                        Supervised by: {item.supervisor}
                                      </p>
                                    </div>
                                  </div>
                                  {!isMobile && (
                                    <div
                                      style={{
                                        // width: "fit-content",
                                        maxWidth: "15rem",
                                        minWidth: "10rem",
                                        display: "flex",
                                        flexDirection: "row",
                                        gap: "1rem",
                                        alignItems: "center",
                                        justifyContent: "end",
                                      }}
                                    >
                                      {link ? (
                                        <a
                                          href={`${link}`}
                                          target="_blank"
                                          style={{
                                            color: "#1677FF",
                                            textDecoration: "none",
                                          }}
                                        >
                                          View Description
                                        </a>
                                      ) : (
                                        <p
                                          style={{
                                            color: "red",
                                            opacity: "0.5",
                                          }}
                                        >
                                          No Description
                                        </p>
                                      )}
                                      <DeleteOutlined
                                        onClick={() => {
                                          const newList = myList.filter(
                                            (i: any) =>
                                              i.topic + i.supervisor !==
                                              item.topic + item.supervisor
                                          );
                                          setMyList(newList);
                                        }}
                                        style={{ color: "red" }}
                                      />
                                    </div>
                                  )}
                                </div>
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
      <Analytics />
    </>
  );
};

export default App;
