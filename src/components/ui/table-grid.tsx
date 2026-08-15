import { Table } from "antd";
const TableGrid = ({
  noGap,
  noMargin,
  customGrid,
  items,
  colKey,
  maxPageSize,
  lastItem,
  isFull,
  heightFull,
}: any) => {
  return (
    <Table
      pagination={
        items?.length > (maxPageSize || 10)
          ? {
              showSizeChanger: false,
              pageSize: maxPageSize || 10,
              position: ["bottomCenter"],
            }
          : false
      }
      size="large"
      showHeader={false}
      className={`w-full ${noMargin ? "" : "m-4"} ${
        heightFull ? "h--full" : ""
      } table--grid ${noGap ? "no--gap" : ""} ${lastItem ? "last--item" : ""}`}
      rowClassName={(rec?: any, ..._args: any[]) =>
        `${
          isFull && isFull?.some(({ key }) => key == rec?.key) ? "w-full" : ""
        } rounded flex ${customGrid ? customGrid : "xl:w-1/3 2xl:w-1/4"} grow`
      }
      columns={[
        {
          dataIndex: colKey,
          key: colKey,
        },
      ]}
      dataSource={items?.map(({ key, element }: any) => ({
        key,
        [colKey]: element,
      }))}
    />
  );
};

export default TableGrid;
