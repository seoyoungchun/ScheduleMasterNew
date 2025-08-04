import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");
const CELL_SIZE = Math.floor((width - 20) / 7);

// 2025년 한국 공휴일
const KOREAN_HOLIDAYS = {
  "2025-01-01": "신정",
  "2025-01-28": "설날연휴",
  "2025-01-29": "설날",
  "2025-01-30": "설날연휴",
  "2025-03-01": "삼일절",
  "2025-05-05": "어린이날",
  "2025-05-13": "부처님오신날",
  "2025-06-06": "현충일",
  "2025-08-15": "광복절",
  "2025-09-06": "추석연휴",
  "2025-09-07": "추석",
  "2025-09-08": "추석연휴",
  "2025-10-03": "개천절",
  "2025-10-09": "한글날",
  "2025-12-25": "성탄절",
};

// 카테고리 색상
const CATEGORIES = {
  personal: { name: "개인", color: "#1A73E8" },
  family: { name: "가족", color: "#0D7377" },
  work: { name: "업무", color: "#F9AB00" },
  holiday: { name: "공휴일", color: "#D50000" },
  anniversary: { name: "기념일", color: "#9C27B0" },
};

// 주간시간표 컴포넌트
const WeeklySchedule = () => {
  const [startHour, setStartHour] = useState(9); // 시작 시간 (시)
  const [startMinute, setStartMinute] = useState(0); // 시작 분 (0, 5, 10, ..., 55)
  const [schedule, setSchedule] = useState({
    // 샘플 데이터
    "월-9:00": { subject: "수학", memo: "교실 변경" },
    "화-10:00": { subject: "영어", memo: "원어민 수업" },
    "수-11:00": { subject: "과학", memo: "실험실" },
    "목-14:00": { subject: "체육", memo: "운동장" },
    "금-13:00": { subject: "음악", memo: "음악실" },
  });

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subjectText, setSubjectText] = useState("");
  const [memoText, setMemoText] = useState("");

  // 시간 배열 생성 (시작시간부터 14시간, 1시간 간격)
  const getTimeSlots = () => {
    const slots = [];
    const startTotalMinutes = startHour * 60 + startMinute;

    for (let i = 0; i < 14; i++) {
      const totalMinutes = startTotalMinutes + i * 60;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    }
    return slots;
  };

  // 시작시간 표시 함수
  const getStartTimeDisplay = () => {
    return `${startHour.toString().padStart(2, "0")}:${startMinute
      .toString()
      .padStart(2, "0")}`;
  };

  // 요일 배열
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  // 오늘 요일 확인
  const getTodayIndex = () => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // 일요일(0)을 6으로, 나머지는 -1
  };

  // 시간 조정 (5분 단위)
  const adjustStartTime = (type, direction) => {
    if (type === "hour") {
      const newHour = startHour + direction;
      if (newHour >= 6 && newHour <= 22) {
        setStartHour(newHour);
      }
    } else if (type === "minute") {
      let newMinute = startMinute + direction * 5;
      let newHour = startHour;

      if (newMinute >= 60) {
        newMinute = 0;
        newHour = startHour + 1;
      } else if (newMinute < 0) {
        newMinute = 55;
        newHour = startHour - 1;
      }

      if (newHour >= 6 && newHour <= 22) {
        setStartHour(newHour);
        setStartMinute(newMinute);
      }
    }
  };

  // 셀 클릭 핸들러
  const handleCellPress = (day, time) => {
    const key = `${day}-${time}`;
    const existing = schedule[key];

    setSelectedSlot({ day, time, key });
    setSubjectText(existing?.subject || "");
    setMemoText(existing?.memo || "");
    setModalVisible(true);
  };

  // 일정 저장
  const saveSchedule = () => {
    if (!subjectText.trim()) {
      Alert.alert("알림", "과목명을 입력하세요.");
      return;
    }

    setSchedule((prev) => ({
      ...prev,
      [selectedSlot.key]: {
        subject: subjectText.trim(),
        memo: memoText.trim(),
      },
    }));

    setModalVisible(false);
    setSubjectText("");
    setMemoText("");
  };

  // 일정 삭제
  const deleteSchedule = () => {
    Alert.alert("삭제 확인", "이 시간표를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setSchedule((prev) => {
            const updated = { ...prev };
            delete updated[selectedSlot.key];
            return updated;
          });
          setModalVisible(false);
        },
      },
    ]);
  };

  const timeSlots = getTimeSlots();
  const todayIndex = getTodayIndex();

  return (
    <View style={scheduleStyles.container}>
      {/* 시간 조정 헤더 - 개선된 5분 단위 */}
      <View style={scheduleStyles.timeHeader}>
        <Text style={scheduleStyles.timeLabel}>시작 시간:</Text>

        {/* 시간 조정 */}
        <View style={scheduleStyles.timeAdjustContainer}>
          <View style={scheduleStyles.timeGroup}>
            <TouchableOpacity
              style={scheduleStyles.timeButton}
              onPress={() => adjustStartTime("hour", -1)}
            >
              <Text style={scheduleStyles.timeButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={scheduleStyles.timeUnitText}>
              {startHour.toString().padStart(2, "0")}시
            </Text>
            <TouchableOpacity
              style={scheduleStyles.timeButton}
              onPress={() => adjustStartTime("hour", 1)}
            >
              <Text style={scheduleStyles.timeButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={scheduleStyles.timeGroup}>
            <TouchableOpacity
              style={scheduleStyles.timeButton}
              onPress={() => adjustStartTime("minute", -1)}
            >
              <Text style={scheduleStyles.timeButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={scheduleStyles.timeUnitText}>
              {startMinute.toString().padStart(2, "0")}분
            </Text>
            <TouchableOpacity
              style={scheduleStyles.timeButton}
              onPress={() => adjustStartTime("minute", 1)}
            >
              <Text style={scheduleStyles.timeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={scheduleStyles.timeDisplay}>
          = {getStartTimeDisplay()}
        </Text>
      </View>

      <ScrollView
        style={scheduleStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 시간표 헤더 */}
        <View style={scheduleStyles.tableHeader}>
          <View style={scheduleStyles.timeColumn}>
            <Text style={scheduleStyles.headerText}>시간</Text>
          </View>
          {weekDays.map((day, index) => (
            <View
              key={day}
              style={[
                scheduleStyles.dayColumn,
                index === todayIndex && scheduleStyles.todayColumn,
              ]}
            >
              <Text
                style={[
                  scheduleStyles.headerText,
                  index === todayIndex && scheduleStyles.todayHeaderText,
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* 시간표 본체 */}
        {timeSlots.map((time) => (
          <View key={time} style={scheduleStyles.tableRow}>
            <View style={scheduleStyles.timeColumn}>
              <Text style={scheduleStyles.timeText}>{time}</Text>
            </View>
            {weekDays.map((day, index) => {
              const key = `${day}-${time}`;
              const cellData = schedule[key];

              return (
                <TouchableOpacity
                  key={`${day}-${time}`}
                  style={[
                    scheduleStyles.dayColumn,
                    scheduleStyles.scheduleCell,
                    index === todayIndex && scheduleStyles.todayCell,
                    cellData && scheduleStyles.filledCell,
                  ]}
                  onPress={() => handleCellPress(day, time)}
                >
                  {cellData ? (
                    <View style={scheduleStyles.cellContent}>
                      <Text
                        style={scheduleStyles.subjectText}
                        numberOfLines={1}
                      >
                        {cellData.subject}
                      </Text>
                      {cellData.memo && (
                        <Text style={scheduleStyles.memoText} numberOfLines={1}>
                          {cellData.memo}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={scheduleStyles.emptyText}>+</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* 일정 편집 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>시간표 편집</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedSlot && (
              <Text style={modalStyles.timeInfo}>
                {selectedSlot.day}요일 {selectedSlot.time}
              </Text>
            )}

            <Text style={modalStyles.label}>과목명</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="과목명을 입력하세요"
              value={subjectText}
              onChangeText={setSubjectText}
              maxLength={20}
            />

            <Text style={modalStyles.label}>메모</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="메모를 입력하세요 (선택사항)"
              value={memoText}
              onChangeText={setMemoText}
              maxLength={50}
            />

            <View style={modalStyles.buttonContainer}>
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={saveSchedule}
              >
                <Text style={modalStyles.saveButtonText}>저장</Text>
              </TouchableOpacity>

              {schedule[selectedSlot?.key] && (
                <TouchableOpacity
                  style={modalStyles.deleteButton}
                  onPress={deleteSchedule}
                >
                  <Text style={modalStyles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 메모장 컴포넌트
const MemoList = () => {
  const [memos, setMemos] = useState([
    {
      id: 1,
      text: "내일 프로젝트 발표 준비하기",
      date: "2025. 8. 4. 오후 2:30",
    },
    {
      id: 2,
      text: "엄마 생신 선물 구매하기",
      date: "2025. 8. 4. 오후 1:15",
    },
    {
      id: 3,
      text: "영어 숙제 완성하고 제출",
      date: "2025. 8. 4. 오전 11:45",
    },
  ]);
  const [newMemo, setNewMemo] = useState("");
  const [searchText, setSearchText] = useState("");

  // 메모 추가
  const addMemo = () => {
    if (newMemo.trim() === "") {
      Alert.alert("알림", "메모 내용을 입력하세요.");
      return;
    }

    const memo = {
      id: Date.now(),
      text: newMemo.trim(),
      date: new Date().toLocaleString("ko-KR"),
    };

    setMemos([memo, ...memos]);
    setNewMemo("");
  };

  // 메모 삭제
  const deleteMemo = (id) => {
    Alert.alert("메모 삭제", "이 메모를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => setMemos(memos.filter((memo) => memo.id !== id)),
      },
    ]);
  };

  // 메모 검색 필터링
  const filteredMemos = memos.filter((memo) =>
    memo.text.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={memoStyles.container}>
      {/* 메모 추가 섹션 */}
      <View style={memoStyles.addSection}>
        <TextInput
          style={memoStyles.addInput}
          placeholder="새 메모를 입력하세요..."
          value={newMemo}
          onChangeText={setNewMemo}
          multiline
          maxLength={200}
        />
        <TouchableOpacity style={memoStyles.addButton} onPress={addMemo}>
          <Text style={memoStyles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 바 */}
      <View style={memoStyles.searchSection}>
        <TextInput
          style={memoStyles.searchInput}
          placeholder="메모 검색..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={memoStyles.clearButton}
            onPress={() => setSearchText("")}
          >
            <Text style={memoStyles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 메모 개수 표시 */}
      <View style={memoStyles.countSection}>
        <Text style={memoStyles.countText}>
          {searchText
            ? `검색 결과: ${filteredMemos.length}개`
            : `전체 메모: ${memos.length}개`}
        </Text>
      </View>

      {/* 메모 리스트 */}
      <ScrollView
        style={memoStyles.memoList}
        showsVerticalScrollIndicator={false}
      >
        {filteredMemos.length === 0 ? (
          <View style={memoStyles.emptyContainer}>
            <Text style={memoStyles.emptyIcon}>📝</Text>
            <Text style={memoStyles.emptyText}>
              {searchText ? "검색 결과가 없습니다." : "메모가 없습니다."}
            </Text>
            {!searchText && (
              <Text style={memoStyles.emptySubText}>
                위에서 새 메모를 추가해보세요!
              </Text>
            )}
          </View>
        ) : (
          filteredMemos.map((memo, index) => (
            <View key={memo.id} style={memoStyles.memoItem}>
              {/* 메모 헤더 */}
              <View style={memoStyles.memoHeader}>
                <Text style={memoStyles.memoIndex}>#{index + 1}</Text>
                <Text style={memoStyles.memoDate}>{memo.date}</Text>
                <TouchableOpacity
                  style={memoStyles.deleteButton}
                  onPress={() => deleteMemo(memo.id)}
                >
                  <Text style={memoStyles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>

              {/* 메모 내용 */}
              <Text style={memoStyles.memoText}>{memo.text}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// 월간계획표 컴포넌트 (기존 코드 유지)
const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({
    "2025-08-05": [{ id: 1, title: "프로젝트 미팅", category: "work" }],
    "2025-08-15": [{ id: 2, title: "광복절", category: "holiday" }],
    "2025-08-20": [{ id: 3, title: "엄마 생신", category: "family" }],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("personal");
  const [editingEvent, setEditingEvent] = useState(null);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const calendarStartDate = new Date(year, month, 1 - startDay);

    const calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(calendarStartDate);
      currentDay.setDate(calendarStartDate.getDate() + i);
      calendarDays.push(currentDay);
    }
    return calendarDays;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getHoliday = (date) => {
    return KOREAN_HOLIDAYS[formatDate(date)];
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDatePress = (date) => {
    if (!isCurrentMonth(date)) return;
    setSelectedDate(date);
    setEventTitle("");
    setEventCategory("personal");
    setEditingEvent(null);
    setModalVisible(true);
  };

  const saveEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert("알림", "일정 제목을 입력하세요.");
      return;
    }

    const dateKey = formatDate(selectedDate);
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      title: eventTitle.trim(),
      category: eventCategory,
    };

    setEvents((prev) => {
      const updated = { ...prev };
      if (!updated[dateKey]) updated[dateKey] = [];

      if (editingEvent) {
        updated[dateKey] = updated[dateKey].map((event) =>
          event.id === editingEvent.id ? newEvent : event
        );
      } else {
        updated[dateKey] = [...updated[dateKey], newEvent];
      }

      return updated;
    });

    setModalVisible(false);
    setEventTitle("");
    setEditingEvent(null);
  };

  const deleteEvent = (eventId) => {
    const dateKey = formatDate(selectedDate);
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey]?.filter((event) => event.id !== eventId) || [],
    }));
  };

  const editEvent = (event) => {
    setEventTitle(event.title);
    setEventCategory(event.category);
    setEditingEvent(event);
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={calendarStyles.container}>
      <View style={calendarStyles.header}>
        <TouchableOpacity
          style={calendarStyles.navButton}
          onPress={() => navigateMonth(-1)}
        >
          <Text style={calendarStyles.navText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={calendarStyles.monthButton}
          onPress={goToToday}
        >
          <Text style={calendarStyles.monthText}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={calendarStyles.navButton}
          onPress={() => navigateMonth(1)}
        >
          <Text style={calendarStyles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={calendarStyles.weekHeader}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, index) => (
          <View key={day} style={calendarStyles.weekCell}>
            <Text
              style={[
                calendarStyles.weekText,
                index === 0 && calendarStyles.sundayText,
                index === 6 && calendarStyles.saturdayText,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={calendarStyles.calendar}>
          {calendarDays.map((date, index) => {
            const dateKey = formatDate(date);
            const dayEvents = events[dateKey] || [];
            const holiday = getHoliday(date);
            const dayOfWeek = date.getDay();

            return (
              <View
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`}
                style={[
                  calendarStyles.dateCell,
                  isToday(date) && calendarStyles.todayCell,
                  !isCurrentMonth(date) && calendarStyles.otherMonthCell,
                ]}
              >
                <TouchableOpacity
                  style={calendarStyles.dateTouchable}
                  onPress={() => handleDatePress(date)}
                  activeOpacity={0.7}
                >
                  <View style={calendarStyles.dateHeader}>
                    <Text
                      style={[
                        calendarStyles.dateText,
                        !isCurrentMonth(date) && calendarStyles.otherMonthText,
                        isToday(date) && calendarStyles.todayText,
                        dayOfWeek === 0 &&
                          isCurrentMonth(date) &&
                          calendarStyles.sundayDateText,
                        dayOfWeek === 6 &&
                          isCurrentMonth(date) &&
                          calendarStyles.saturdayDateText,
                        holiday && calendarStyles.holidayDateText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </View>

                  {holiday && (
                    <Text style={calendarStyles.holidayText}>
                      {holiday.length > 3 ? holiday.substring(0, 2) : holiday}
                    </Text>
                  )}

                  <View style={calendarStyles.eventsContainer}>
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <View
                        key={`${event.id}-${idx}`}
                        style={[
                          calendarStyles.eventBar,
                          { backgroundColor: CATEGORIES[event.category].color },
                        ]}
                      >
                        <Text
                          style={calendarStyles.eventBarText}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                      </View>
                    ))}

                    {dayEvents.length > 3 && (
                      <Text style={calendarStyles.moreEvents}>
                        +{dayEvents.length - 3}개 더
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modal}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>
                {editingEvent ? "일정 수정" : "일정 추가"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={modalStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.dateText}>
              {selectedDate &&
                `${selectedDate.getFullYear()}년 ${
                  selectedDate.getMonth() + 1
                }월 ${selectedDate.getDate()}일`}
            </Text>

            <TextInput
              style={modalStyles.input}
              placeholder="일정 제목을 입력하세요"
              value={eventTitle}
              onChangeText={setEventTitle}
              maxLength={50}
            />

            <Text style={modalStyles.label}>카테고리</Text>
            <View style={modalStyles.categoryContainer}>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    modalStyles.categoryButton,
                    { backgroundColor: category.color },
                    eventCategory === key && modalStyles.selectedCategory,
                  ]}
                  onPress={() => setEventCategory(key)}
                >
                  <Text style={modalStyles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedDate && events[formatDate(selectedDate)]?.length > 0 && (
              <View style={modalStyles.existingEvents}>
                <Text style={modalStyles.label}>기존 일정</Text>
                {events[formatDate(selectedDate)].map((event) => (
                  <View key={event.id} style={modalStyles.eventItem}>
                    <View style={modalStyles.eventInfo}>
                      <View
                        style={[
                          modalStyles.eventColorDot,
                          { backgroundColor: CATEGORIES[event.category].color },
                        ]}
                      />
                      <Text style={modalStyles.eventText}>{event.title}</Text>
                    </View>
                    <View style={modalStyles.eventActions}>
                      <TouchableOpacity
                        onPress={() => editEvent(event)}
                        style={modalStyles.editButton}
                      >
                        <Text style={modalStyles.editButtonText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteEvent(event.id)}
                        style={modalStyles.deleteButton}
                      >
                        <Text style={modalStyles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={modalStyles.saveButton}
              onPress={saveEvent}
            >
              <Text style={modalStyles.saveButtonText}>
                {editingEvent ? "수정" : "추가"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 메인 App 컴포넌트
export default function App() {
  const [currentTab, setCurrentTab] = useState("schedule"); // 주간시간표를 기본으로

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ScheduleMaster</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentTab === "schedule" && styles.activeTab]}
          onPress={() => setCurrentTab("schedule")}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === "schedule" && styles.activeTabText,
            ]}
          >
            주간시간표
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentTab === "calendar" && styles.activeTab]}
          onPress={() => setCurrentTab("calendar")}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === "calendar" && styles.activeTabText,
            ]}
          >
            월간계획표
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentTab === "memo" && styles.activeTab]}
          onPress={() => setCurrentTab("memo")}
        >
          <Text
            style={[
              styles.tabText,
              currentTab === "memo" && styles.activeTabText,
            ]}
          >
            메모장
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {currentTab === "schedule" && <WeeklySchedule />}

        {currentTab === "calendar" && <CalendarGrid />}

        {currentTab === "memo" && <MemoList />}
      </View>
    </View>
  );
}

// 메인 앱 스타일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 3,
    borderRadius: 8,
  },
  activeTab: { backgroundColor: "#1A73E8" },
  tabText: { fontSize: 14, color: "#666", fontWeight: "500" },
  activeTabText: { color: "#fff", fontWeight: "bold" },
  content: { flex: 1, backgroundColor: "#fff" },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  placeholderText: { fontSize: 16, color: "#666", textAlign: "center" },
});

// 주간시간표 스타일
const scheduleStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 15,
  },
  timeAdjustContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  timeGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  timeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  timeButtonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  timeUnitText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  timeDisplay: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A73E8",
    marginLeft: 15,
    minWidth: 60,
    textAlign: "center",
  },
  scrollView: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 2,
    borderBottomColor: "#1A73E8",
  },
  timeColumn: {
    width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
  },
  dayColumn: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e9ecef",
  },
  todayColumn: { backgroundColor: "#e3f2fd" },
  headerText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  todayHeaderText: { color: "#1A73E8" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scheduleCell: {
    minHeight: 50,
    backgroundColor: "#fff",
  },
  todayCell: { backgroundColor: "#f8fbff" },
  filledCell: { backgroundColor: "#e8f5e8" },
  cellContent: {
    flex: 1,
    padding: 4,
    justifyContent: "center",
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  memoText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 50,
  },
  timeText: {
    fontSize: 12,
    color: "#1A73E8",
    fontWeight: "500",
  },
});

//  메모장 스타일
const memoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  addSection: {
    marginBottom: 15,
  },
  addInput: {
    height: 80,
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#1A73E8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "flex-end",
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#5f6368",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  countSection: {
    marginBottom: 10,
  },
  countText: {
    fontSize: 14,
    color: "#5f6368",
    fontWeight: "500",
  },
  memoList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#9aa0a6",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9aa0a6",
    textAlign: "center",
  },
  memoItem: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1A73E8",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  memoIndex: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1A73E8",
    backgroundColor: "#e8f0fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memoDate: {
    fontSize: 12,
    color: "#5f6368",
    flex: 1,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#d93025",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  memoText: {
    fontSize: 16,
    color: "#3c4043",
    lineHeight: 22,
  },
});

// 달력 스타일 (기존 유지)
const calendarStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dadce0",
  },
  navText: { fontSize: 20, fontWeight: "400", color: "#5f6368" },
  monthButton: { paddingHorizontal: 16, paddingVertical: 8 },
  monthText: {
    fontSize: 22,
    fontWeight: "400",
    color: "#3c4043",
    textAlign: "center",
  },
  weekHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dadce0",
    marginBottom: 8,
  },
  weekCell: {
    width: CELL_SIZE,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  weekText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#70757a",
    letterSpacing: 0.8,
  },
  sundayText: { color: "#d93025" },
  saturdayText: { color: "#1a73e8" },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dateCell: {
    width: CELL_SIZE,
    minHeight: CELL_SIZE + 20,
    borderWidth: 0.5,
    borderColor: "#dadce0",
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  dateTouchable: { flex: 1, padding: 2 },
  dateHeader: { alignItems: "center", marginBottom: 2 },
  todayCell: { backgroundColor: "#e8f0fe" },
  otherMonthCell: { backgroundColor: "#f8f9fa" },
  dateText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#3c4043",
    textAlign: "center",
  },
  todayText: {
    backgroundColor: "#1a73e8",
    color: "#fff",
    width: 24,
    height: 24,
    borderRadius: 12,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  otherMonthText: { color: "#9aa0a6" },
  sundayDateText: { color: "#d93025" },
  saturdayDateText: { color: "#1a73e8" },
  holidayDateText: { color: "#d93025", fontWeight: "500" },
  holidayText: {
    fontSize: 8,
    color: "#d93025",
    textAlign: "center",
    marginBottom: 2,
  },
  eventsContainer: { flex: 1, justifyContent: "flex-start" },
  eventBar: {
    height: 12,
    borderRadius: 2,
    marginBottom: 1,
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  eventBarText: { fontSize: 8, color: "#fff", fontWeight: "500" },
  moreEvents: {
    fontSize: 7,
    color: "#5f6368",
    textAlign: "center",
    marginTop: 1,
  },
});

// 모달 스타일
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    maxHeight: "80%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "500", color: "#3c4043" },
  closeButton: {
    fontSize: 24,
    color: "#5f6368",
    width: 32,
    height: 32,
    textAlign: "center",
    lineHeight: 32,
  },
  timeInfo: {
    fontSize: 16,
    color: "#1a73e8",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 14,
    color: "#1a73e8",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: { fontSize: 14, fontWeight: "500", color: "#3c4043", marginBottom: 8 },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  existingEvents: { marginBottom: 16 },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  eventInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  eventColorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  eventText: { fontSize: 14, color: "#3c4043", flex: 1 },
  eventActions: { flexDirection: "row" },
  editButton: {
    backgroundColor: "#1a73e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  editButtonText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  deleteButton: {
    backgroundColor: "#d93025",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: { color: "#fff", fontSize: 12, fontWeight: "500" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: {
    backgroundColor: "#1a73e8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
