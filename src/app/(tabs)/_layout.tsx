import "@/global.css";
import React from "react";
import { Tabs, useRouter } from "expo-router";
import { BottomMenu } from "@/components/nav/bottom-menu";
import { TopHeader } from "@/components/nav/top-header";
import { TopFeed } from "@/components/nav/top-feed";

export default function TabLayout() {
  const router = useRouter();
  const user = {
    avatarUri:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMVFhUXFxgYGBgYFxgbGhsYHRgYHRoXFxgaHSggGBolGxgYITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0lICUvLS0tLS0tLS0tLS0vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALEBHAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAADBAIFAAEGB//EADwQAAEDAgMFBgYABQQBBQAAAAEAAhEDIQQxQQUSUWHwBnGBobHBEyIykdHhIzNCUvEHFGJyNBZDgqLC/8QAGgEAAgMBAQAAAAAAAAAAAAAAAQIAAwQFBv/EACoRAAICAQMDBAICAwEAAAAAAAABAhEDBBIhMUFRIjJhcTOBBSMTQkMU/9oADAMBAAIRAxEAPwCiFNZBR6d1MN1iUGUrqABOZzRGtnVGNPrx9Fg5JRgYp+Sm2ijtbxU6UZIgBsYBEC4IvNvDgt4hoLiRr6cVIxKjkNURewPdWvhmEcBbaz9fpKxrtC3wtEWnRMXjinKeHJ/aap4PuQboaKsqYvwWz6K1GBbz8u5bOz5GSG9EUGVRZxUmp8YOCLeHWiDUwxuQI80bQKARPd++SzchENIjJR3FCEHUTExHMhLOZfzTTwTqcua2yk3+qe4e5UCJimcpRAzTo6plzJ0tPQWfDvPWilE3UB+EFv4SYjr8rA0AifRRoClYBjGwZB5RHml30Z1lPPbFpHgeaE9w4jrryQGBGmSMz1w/KVqUoTDnnOboYdOZlREAtYSYAN+C2/Dkbrj9JOYvJGYU6NQNv5aePJWmy8Q1wNN7Rc7zeWVh1xQnJpWGK5Oc35r1HTkAJHNN1azmlrd4/M0ujuMQmHUaYIMGS070ZF7XbpAA5yUttKnFZobBimTHG8kDnw5rNF1tRftu2FpYkze41W21m3+XPLke7u9kfC4Wm+28fmY1zP8AkDmMrEWt/wAgh1qP/uAfI76SMv1HtyWpNPoZ5WhN4QjMmyOVEuhOJYxRZZFa1aB0F+uKi11+vH0Vm3gq3chA1bbTjmogTxUi8pKH3ExmtgcM+Cye5QZn6dHJCiWmFbUIngeQ6lALr9c0So0tJDpBUBcok+AtMyQnKFNAoU9OXQurjB0LDoKqcqHhDknQo9dZJk0+KHWqhjC53ygSfAeeS897Q9pn1XENLmNA0OvErJcpvg2RgkuT0aBwHWaI1vAWXilTa9ZwE1HyMjvGR5q0Ha3GEXrOERER+OrR/wAM/IU4M9WfRGfXX7QalD/PPXxXn+D7e4hpHxGte0Z6E20It5Lttl7ZoV2gseJI+kkBwN7Qq7nHqHZF9CGIocCkXCDl17K4q0xdJVqa1Y52Z5wpgGvcQQCQNetEs5kc+iiQchPNBrtLTE3+6tRWSbVloGnCLd/esL+vVCYsL/smF6hgTdRqE3v13oAfY9dZLGvtfxQDRpz9J690Pe9FMhaLOvBQgIlaAHHXNS3VA5ZokQPW3gi1TDvh0xvVN25JhonU9yZ2TTmpOcAn290DBPa2rVrPcAJIvpE6cVg1OV3tXg36XCmtzEqoOHpH4jiXukt3ZibZnRKYHGGpUc95h26BbhrC1tvGfEe5wO9TP0nl7JbYVP5ybxET13KzTq6bBnpJ0Xra549W/CM+uS20Q0Egaklwc7vc6Iv/AHFaFOQMlNtAgTumOP4K1UjDuFLxfMAExoTChvHT8Kyo0AfliJ5dch3BI4hm64g2Pj7JkI14CME5KYF/FNMpUw36wTbIGwOvMok0gDAcTxkCePGE7ZXGIpPeovbATW/TP9LuVwPa6DUjTw5ckAtAgSPVbe86DuUy22fXBJ1zmUSvlMtRWpEN+JIcWj6ZiIie+6hXZTn5Xkd4m/epbOol9EPDWF2ozI4QB7+ak3CjPX3VSfyan9B8FTcCBO8OI5xxV7RpaKm2e+Hjh++iukYLQs2dui7EuTje3mPLGtYciDPWv7XDfFLmhrQL+ff3K/7e4r4lf4YyaACeZz/C12d7N/7ljnF27o0jTwValHHDdI105S2o5FlL5oi+qZrWAAB1XaUOx4pvaXvnwzP3S/afZLWt3hAjuEqf+uEpKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRKKAtPJKziKiJhcQWEEEiDaFKsAUCLrWqoodpnq3Z3bIq0m70l4BmB9iVY1Tr11kvNOyu1TSrNv8AI47rgeBt916U53XuslbJ0GXqjYk6RB+yFM3OfD88UWsUE/la0ZmDUCJsUUieKGG96cSwW5111ZDeOaacxQ+GeKUYXC2Sb3U6lAznxURQOWvQUsJEjigVE42jzhbbRbxJPooQY2EAXO+URF8+X7SO3qTGU6v8NgMNAN5kl05k6BXWxcPute7jqqPtTUJZGrnZcoEe/wB1ysuS87r4Olh4w8nMYGg+qNxs7s3OnjzXT4TZoY2Jy8+a3gMEGtaAYt5qxpM3QAXfjzXTitvJhyT3Bdl06TZe4yGAWItwy1/aar7aBECnb25KvcBlxhR3I5o1bK+3A8/aQ3YazdPEwqWvS3jJz74904TI4W9vJAcfHxTJUB8i7SYInvU6Q4qLLCL3hS9VZRVuo2WKRapBqxwjJQDIFqI2gNVjJzKOSDlrxRRW+o/stgZTa1oA+Y6cxHcmA3faQWiJjQHM6a8ZVfhP6hFhBnTK8cvlz70w3EkutnGXMxprZZkmnaN7pqmDbDaxAMNlvhYLoaDhGua574f8U6Ehp8rePuFc4Opax7/PJVZY+gbG/Weadr27teoIvvE84MEJ3s72hbh8O1u657yTYaC+ZWf6k0gKzXiPmbpysVU9k8M2rUNJ5ixcPQ+Fx9lRK",
    userName: "John Doe",
    message: "Hello, how are you?",
  };

  return (
    <Tabs
      screenOptions={({ route }) => {
        const isFeedRoute =
          route.name === "index" ||
          route.name === "following" ||
          route.name === "favorites";
        const isProfileRoute = route.name === "profile";
        const isMessagesRoute = route.name === "messages";
        const isConversationRoute = route.name === "conversation";
        const isEditProfileRoute = route.name === "edit-profile";
        const isOtherProfileRoute = route.name === "other-profile";
        const isScoreResultRoute = route.name === "score-result";
        const isVideoFormRoute = route.name === "video-form";
        // Screens with their own inline header (no navigation header needed)
        const isResearchDancesRoute = route.name === "research-dances";
        const isVideoPerformRoute = route.name === "video-perform";
        const isVideoRecordingRoute = route.name === "video-recording";
        const isVideoReviewRoute = route.name === "video-review";
        // Screens with their own inline header (no navigation header needed)
        const isFullscreenRoute =
          route.name === "video-creation" ||
          route.name === "send" ||
          isVideoPerformRoute ||
          isVideoRecordingRoute ||
          isVideoReviewRoute;

        const conversationParams = isConversationRoute
          ? (route.params as
              | { userName?: string; avatarUri?: string; isOnline?: string }
              | undefined)
          : undefined;

        return {
          headerTransparent: true,
          header: () => {
            if (isFullscreenRoute) return null;
            if (isFeedRoute) return <TopFeed />;
            if (isProfileRoute)
              return (
                <TopHeader
                  title="MON PROFIL"
                  editButton
                  onEdit={() => router.push("/(tabs)/edit-profile")}
                />
              );
            if (isMessagesRoute)
              return <TopHeader title="MESSAGES" avatarUri={user.avatarUri} />;
            if (isConversationRoute)
              return (
                <TopHeader
                  backButton
                  userItem={
                    conversationParams
                      ? {
                          avatarUri: conversationParams.avatarUri ?? "",
                          userName: conversationParams.userName ?? "",
                          message:
                            conversationParams.isOnline === "true"
                              ? "En ligne"
                              : "",
                          isOnline: conversationParams.isOnline === "true",
                        }
                      : undefined
                  }
                />
              );
            if (isEditProfileRoute)
              return <TopHeader backButton title="MODIFIER LE PROFIL" />;
            if (isOtherProfileRoute)
              return <TopHeader backButton title="PROFIL" moreButton />;
            if (isScoreResultRoute)
              return <TopHeader backButton title="RÉSULTAT" />;
            if (isVideoFormRoute)
              return <TopHeader backButton title="NOUVELLE VIDEO" />;
            if (isResearchDancesRoute)
              return (
                <TopHeader
                  backButton
                  title="RECHERCHE"
                  avatarUri={user.avatarUri}
                />
              );
            return <TopHeader backButton userItem={user} />;
          },
        };
      }}
      tabBar={(props) => <BottomMenu {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      <Tabs.Screen name="search" options={{ title: "Recherche" }} />
      <Tabs.Screen name="conversation" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="other-profile" options={{ href: null }} />
      <Tabs.Screen name="score-result" options={{ href: null }} />
      <Tabs.Screen name="video-creation" options={{ href: null }} />
      <Tabs.Screen name="video-form" options={{ href: null }} />
      <Tabs.Screen name="send" options={{ href: null }} />
      <Tabs.Screen name="research-dances" options={{ href: null }} />
      <Tabs.Screen name="video-perform" options={{ href: null }} />
      <Tabs.Screen name="video-recording" options={{ href: null }} />
      <Tabs.Screen name="video-review" options={{ href: null }} />
    </Tabs>
  );
}
