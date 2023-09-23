export const bedCount = 4

//export const exhibitEndTime = new Date("2023-09-22T14:00:00-05:00")
//export const exhibitEndTime = new Date("2023-09-20T14:10:00-05:00")

function createDate(year, month, day, hour, minute) {
	return new Date(year, month - 1, day, hour - 1, minute)
}

export const exhibitEndTime = createDate(2023, 9, 23, 21)
